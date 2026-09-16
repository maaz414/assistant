 import uploadOnCloudinary from "../config/cloudinary.js"
import groqResponse from "../groq.js"
import User from "../models/user.model.js"
import moment from "moment"
import { exec } from "child_process"
import path from "path"
import { removeBackground } from '@imgly/background-removal-node'
 export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
return res.status(400).json({message:"user not found"})
        }

   return res.status(200).json(user)     
    } catch (error) {
       return res.status(400).json({message:"get current user error"}) 
    }
}

export const updateAssistant=async (req,res)=>{
   try {
      const {assistantName,imageUrl}=req.body
      let assistantImage;
if(req.file){
   assistantImage=await uploadOnCloudinary(req.file.path)
}else{
   assistantImage=imageUrl
}

const user=await User.findByIdAndUpdate(req.userId,{
   assistantName,assistantImage
},{new:true}).select("-password")
return res.status(200).json(user)

      
   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"}) 
   }
}


export const askToAssistant = async (req, res) => {
   try {
      const { command, history = [], image } = req.body;
      const user = await User.findById(req.userId);
      if (!user) {
         return res.status(404).json({ type: "general", response: "User not found" });
      }
      user.history.push(command);
      await user.save();
      const userName = user.name;
      const assistantName = user.assistantName;
      
      const resultObjString = await groqResponse(command, assistantName, userName, history, image);

      const jsonMatch = resultObjString.match(/{[\s\S]*}/);
      if (!jsonMatch) {
         return res.status(200).json({ 
            type: "general", 
            userInput: command, 
            response: "I heard you, but I couldn't format the response properly." 
         });
      }
      
      let gemResult;
      try {
         gemResult = JSON.parse(jsonMatch[0]);
      } catch (e) {
         return res.status(200).json({ 
            type: "general", 
            userInput: command, 
            response: "I'm having a little trouble understanding. Could you please repeat that?" 
         });
      }
      console.log("Parsed AI Instructions:", gemResult);
      
      // If AI still returned the old format somehow, normalize it
      const commands = gemResult.commands || [{
         action: gemResult.type,
         target: gemResult.userInput || ""
      }];

      // We will perform system commands, and pass back special "open-browser" instructions if needed
      // Currently the frontend handles type: 'google-search', 'youtube-search' etc.
      // We need to keep frontend compatible or handle it here gracefully.
      // Since frontend expects { type, userInput, response } for browser opens, we'll map the first non-system type back to the frontend.
      
      let frontendType = "general";
      let frontendUserInput = command;

      // Dynamically import system utils so it doesn't crash if not available
      const system = await import("../utils/system.js");

      let systemOutputs = [];
      for (let cmd of commands) {
         let action = cmd.action;
         let target = cmd.target;

         // Handle special targets in open-app
         if (action === "open-app" && typeof target === "string") {
            const tLower = target.toLowerCase().trim();
            if (tLower === "youtube" || tLower.includes("youtube")) {
               action = "youtube-open";
            } else if (tLower === "whatsapp" || tLower.includes("whatsapp")) {
               target = "whatsapp";
            }
         }

         // Handle youtube-search with empty query or "youtube" as youtube-open
         if (action === "youtube-search") {
            const tLower = (typeof target === "string" ? target : "").toLowerCase().trim();
            if (!tLower || tLower === "youtube" || tLower === "open youtube") {
               action = "youtube-open";
            }
         }
         
         // Defensively parse target in case the AI outputs a string instead of an object
         const loc = target?.location || "";
         const itemName = target?.name || (typeof target === 'string' ? target : "");

         let out = "";
         
         switch (action) {
            case "open-app":
               out = await system.openApp(target);
               break;
            case "close-app":
               out = await system.closeApp(target);
               break;
            case "create-folder":
               out = await system.createFolder(loc, itemName);
               break;
            case "create-file":
               out = await system.createFile(loc, itemName);
               break;
            case "delete-item":
               out = await system.deleteItem(loc, itemName);
               break;
            case "rename-item":
               out = await system.renameItem(loc, target?.oldName, target?.newName);
               break;
            case "play-media":
               out = await system.playMedia(target);
               break;
            case "open-folder":
               out = await system.openFolder(loc, itemName);
               break;
            case "open-file":
               out = await system.openFile(loc, itemName);
               break;

            // These are frontend browser commands
            case "google-search":
            case "youtube-search":
            case "youtube-play":
            case "youtube-open":
            case "whatsapp-open":
            case "calculator-open":
            case "instagram-open":
            case "facebook-open":
            case "weather-show":
               frontendType = action;
               frontendUserInput = target;
               if (action === "whatsapp-open") {
                  await system.openApp("whatsapp");
               }
               break;
               
            case "get-date":
               frontendType = "general";
               if (!gemResult.response || gemResult.response.toLowerCase().includes("working on it")) {
                  gemResult.response = `Today's date is ${moment().format("LL")}.`;
               }
               break;
            case "get-time":
               frontendType = "general";
               if (!gemResult.response || gemResult.response.toLowerCase().includes("working on it")) {
                  gemResult.response = `The current time is ${moment().format("hh:mm A")}.`;
               }
               break;
            case "get-day":
               frontendType = "general";
               if (!gemResult.response || gemResult.response.toLowerCase().includes("working on it")) {
                  gemResult.response = `Today is ${moment().format("dddd")}.`;
               }
               break;
            case "get-month":
               frontendType = "general";
               if (!gemResult.response || gemResult.response.toLowerCase().includes("working on it")) {
                  gemResult.response = `The current month is ${moment().format("MMMM")}.`;
               }
               break;
            case "generate-image":
               frontendType = "general";
               let promptText = typeof target === 'string' ? target : (target?.prompt || target?.name || JSON.stringify(target));
               const encodedPrompt = encodeURIComponent(promptText).replace(/\(/g, '%28').replace(/\)/g, '%29');
               const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
               try {
                  const imageRes = await fetch(imageUrl);
                  if (imageRes.ok) {
                     const arrayBuffer = await imageRes.arrayBuffer();
                     const base64Image = Buffer.from(arrayBuffer).toString('base64');
                     gemResult.image = `data:image/jpeg;base64,${base64Image}`;
                     gemResult.displayText = gemResult.displayText || "";
                  } else {
                     gemResult.displayText = "Sorry, I couldn't generate the image right now.";
                  }
               } catch (e) {
                  gemResult.displayText = "Sorry, I encountered an error generating the image.";
               }
               break;
            case "remove-background":
               frontendType = "general";
               if (!image) {
                  gemResult.displayText = "Please upload an image first so I can remove its background.";
                  gemResult.response = "Please upload an image first.";
                  break;
               }
               try {
                  const blob = await removeBackground(image);
                  const arrayBuffer = await blob.arrayBuffer();
                  const base64Image = Buffer.from(arrayBuffer).toString('base64');
                  gemResult.image = `data:image/png;base64,${base64Image}`;
                  gemResult.displayText = "Here is your image with the background removed!";
                  gemResult.response = "I have removed the background from your image.";
               } catch (e) {
                  console.error("Background removal error:", e);
                  gemResult.displayText = "Sorry, I encountered an error removing the background.";
                  gemResult.response = "I couldn't remove the background due to an error.";
               }
               break;
         }
         if (out && (out.includes("does not exist") || out.includes("could not find") || out.includes("already exists"))) {
            systemOutputs.push(out);
         }
      }

      // If we got explicit error strings from system.js missing checks, prepend them to the spoken AI response
      let finalSpokenResponse = gemResult.response || "Working on it.";
      if (systemOutputs.length > 0) {
         finalSpokenResponse = systemOutputs.join(" ") + " " + finalSpokenResponse;
      }

      // If there's a specialized frontend browser task, return it
       if (frontendType !== "general") {
         return res.json({
            type: frontendType,
            userInput: frontendUserInput,
            response: finalSpokenResponse,
            displayText: gemResult.displayText,
            image: gemResult.image
         });
      }

      // Otherwise just respond with the spoken response
      return res.json({
         type: "general",
         userInput: command,
         response: finalSpokenResponse,
         displayText: gemResult.displayText,
         image: gemResult.image
      });

   } catch (error) {
      console.error(error);
      return res.status(500).json({ 
         type: "general", 
         response: "I encountered a technical error while processing that." 
      });
   }
}

export const launchWidget = async (req, res) => {
    try {
        const { x, y, width, height } = req.body;
        // The backend is in 'backend' dir, so frontend is '../frontend'
        const frontendDir = path.resolve(process.cwd(), '../frontend');
        
        // Passing arguments directly to npm run
        const cmd = `npm run start:widget -- --startX=${x} --startY=${y} --width=${width} --height=${height}`;
        
        exec(cmd, { cwd: frontendDir }, (error) => {
            if (error) console.log("Widget launch error:", error);
        });

        return res.status(200).json({ message: "Widget launching..." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Backend error launching widget" });
    }
};