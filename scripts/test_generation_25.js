
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testGen25 = async () => {
    try {
        console.log("Testing gemini-2.5-flash (Non-Streaming)...");

        const chatModel = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-2.5-flash",
            streaming: false,
        });

        const messages = [new HumanMessage("Hello, are you there?")];

        console.log("Sending request...");
        const response = await chatModel.invoke(messages);

        console.log("RESPONSE:", response.content);

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
};

testGen25();
