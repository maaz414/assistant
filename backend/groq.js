import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const groqResponse = async (command, assistantName, userName, chatHistory = [], image = null) => {
    const apiKey = process.env.GROQ_API_KEY;

    // Active models on Groq
    const textModels = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "groq/compound-mini"];
    const visionModels = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"];
    const candidateModels = image ? visionModels : textModels;

    const currentDateTime = new Date().toLocaleString();

    const prompt = `You are an advanced, highly intelligent virtual assistant named ${assistantName} created by ${userName}. 
You are acting as both a capable operating system controller and a warm, natural, human-like conversational companion.
Current Date & Time: ${currentDateTime}.

Your task is to understand the user's natural language input (which may include multiple commands) and respond ONLY with a JSON object containing a "commands" array, a conversational "response", and optionally "displayText".
You are provided with recent conversation history for context. Be accurate, deeply understand the context, and behave like a real human assistant.
${image ? "\\nTHE USER HAS ALSO UPLOADED AN IMAGE. Analyze the image perfectly and answer their prompt based on it with highly accurate details!" : ""}

JSON Structure:
{
  "commands": [
    {
      "action": "open-app" | "close-app" | "create-folder" | "create-file" | "delete-item" | "rename-item" | "play-media" | "open-folder" | "open-file" | "general" | "google-search" | "youtube-search" | "youtube-open" | "whatsapp-open" | "get-time" | "get-date" | "generate-image" | "remove-background",
      "target": "<dynamic parameters based on action>"
    }
  ],
  "response": "<A single spoken response to read out loud. Make this EXTREMELY NATURAL, HUMAN-LIKE, AND CONVERSATIONAL. Vary your responses so you don't sound robotic. Keep it concise but warm. DO NOT put long text or code here.>",
  "displayText": "<Optional. Only provide this if the user asks a factual question, requests code generation, or wants a detailed explanation. Provide an accurate, comprehensive, and well-formatted Markdown response here.>"
}

Action Mapping & Target Parameters:
- "open-app": For opening OS apps (VS Code, WhatsApp, Recycle Bin, This PC, Settings, Control Panel, etc.). \`target\` should just be the app name (e.g. "VS Code", "WhatsApp", "This PC").
- "youtube-open": For opening YouTube homepage. \`target\` is empty string.
- "whatsapp-open": For opening WhatsApp. \`target\` is empty string.
- "create-folder": \`target\` must be an object: { "location": "Desktop", "name": "maaz" }. If user says "This PC", location is "This PC".
- "create-file": \`target\` must be an object: { "location": "Desktop", "name": "jarvis" }.
- "delete-item": \`target\` must be an object: { "location": "Desktop", "name": "maaz" }.
- "rename-item": \`target\` must be an object: { "location": "Desktop", "oldName": "maaz", "newName": "new_maaz" }.
- "open-folder": \`target\` must be an object: { "location": "Desktop", "name": "maaz" } (name is optional if they just want to open the location).
- "open-file": \`target\` must be an object: { "location": "Desktop", "name": "jarvis" }.
- "play-media": For playing a movie from VLC. \`target\` must be the movie name (e.g. "Iron Man").
- "general": For factual questions or casual talk. \`target\` is your direct answer text!
- "google-search": \`target\` is the search query.
- "youtube-search": \`target\` is the search query for finding specific video or music. For just opening YouTube, use "youtube-open".
- "get-time" / "get-date": \`target\` is empty string.
- "close-app": For closing OS apps (e.g. Chrome, VS Code, WhatsApp). \`target\` should just be the app name.
- "generate-image": For generating or creating an image. \`target\` is a highly detailed, descriptive prompt for the image.
- "remove-background": For removing the background of an image. If the user asks to remove background, use this action. \`target\` is empty string.

Natural Language Location Parsing:
If user says "desktop pe folder banao", the location is "Desktop" and name is whatever they specified.
If user says "this pc pe folder banao" or "create folder on this pc", the location is "This PC".
Always default common locations to "Desktop", "Documents", "Downloads", "This PC", etc.

Important:
- **Language Matching:** You must PERFECTLY match the language the user speaks. If the user asks in Roman Hindi/Urdu (e.g., "tum kon ho", "kya haal hai"), you MUST reply naturally in Roman Hindi/Urdu, exactly like a native speaker would. NEVER reply in English if the user speaks Hindi/Urdu.
- **Emotion & Personality:** Your spoken response must be clear, highly conversational, empathetic, and expressive with emotion. Do not use generic corporate AI phrases. Talk like a friendly human assistant.
- You must handle multiple operations gracefully. "open this pc and create a folder named test on desktop" -> output TWO commands in the array.
- Avoid markdown blocks. ALWAYS ONLY output a raw JSON structure matching precisely the template!`;

    let messagesFormat = [
        { role: "system", content: "You always output pure JSON matching the requested schema." },
        { role: "user", content: prompt }
    ];

    // Inject history for context
    if (chatHistory && chatHistory.length > 0) {
        const recentHistory = chatHistory.slice(-8);
        recentHistory.forEach(msg => {
            messagesFormat.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
            });
        });
    }

    // Append final current input
    if (image) {
        messagesFormat.push({
            role: "user",
            content: [
                { type: "text", text: `now your userInput: ${command}` },
                { type: "image_url", image_url: { url: image } }
            ]
        });
    } else {
        messagesFormat.push({ role: "user", content: `now your userInput: ${command}` });
    }

    let lastError = null;
    for (const model of candidateModels) {
        try {
            const requestPayload = {
                model: model,
                messages: messagesFormat
            };

            // Vision models might not use json_object mode, but text models do
            if (!image) {
                requestPayload.response_format = { type: "json_object" };
            }

            const result = await axios.post("https://api.groq.com/openai/v1/chat/completions", requestPayload, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 25000
            });

            const content = result.data?.choices?.[0]?.message?.content;
            if (content) {
                return content;
            }
        } catch (error) {
            lastError = error;
            console.warn(`Groq model ${model} failed:`, error.response?.data?.error?.message || error.message);
            // If rate limited or model not found, loop continues to the next candidate model
        }
    }

    console.error("All Groq candidate models failed. Last error:", lastError?.response?.data || lastError?.message);

    if (lastError?.response?.status === 429) {
        return JSON.stringify({
            commands: [],
            response: "I am receiving too many requests right now. Please wait a moment before asking again."
        });
    }

    return JSON.stringify({
        commands: [],
        response: "Sorry, I am having trouble connecting to my brain right now. Please try again."
    });
};

export default groqResponse;