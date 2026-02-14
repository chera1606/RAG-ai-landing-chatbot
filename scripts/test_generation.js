
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testGen = async () => {
    try {
        console.log("Testing Gemini Generation with model: gemini-2.5-flash");

        const chatModel = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-2.5-flash",
            streaming: false, // Turn off streaming for simple test
        });

        const messages = [
            new SystemMessage("You are a helpful assistant."),
            new HumanMessage("Hello, are you working?"),
        ];

        console.log("Sending request...");
        const response = await chatModel.invoke(messages);

        console.log("RESPONSE:", response.content);

    } catch (error) {
        console.error("❌ GENERATION ERROR:", error);
    }
};

testGen();
