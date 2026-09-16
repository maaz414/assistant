import axios from "axios";
import dotenv from "dotenv";

export const analyzeImage = async (base64Image) => {
    try {
        dotenv.config();
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return "Note: I cannot see the image because my Hugging Face API key is missing. Please tell the user to add it.";
        }

        // Convert base64 to Buffer
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Use Native fetch to bypass any Axios proxy weirdness, and try an alternative robust model
        const response = await fetch(
            "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/octet-stream"
                },
                body: imageBuffer
            }
        );

        const data = await response.json();

        // Check for specific error object (e.g. model loading)
        if (data && data.error) {
            throw new Error(data.error);
        }

        if (Array.isArray(data) && data[0] && data[0].generated_text) {
            return `Image Analysis Output: ${data[0].generated_text}`;
        }
        
        return "Note: I could not analyze the image clearly.";

    } catch (error) {
        const errDetails = error.message || error.toString();
        console.error("Hugging Face API Error:", errDetails);
        return `[SYSTEM ERROR FROM VISION API: ${errDetails}]`;
    }
};
