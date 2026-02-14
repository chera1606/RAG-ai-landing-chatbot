
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testStreaming = async () => {
    try {
        console.log("Testing Streaming with gemini-2.5-flash...");

        const chatModel = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-2.5-flash",
            streaming: true,
        });

        const messages = [new HumanMessage("Count from 1 to 5.")];

        console.log("Starting stream...");
        const stream = await chatModel.stream(messages);

        for await (const chunk of stream) {
            console.log("Chunk:", JSON.stringify(chunk.content));
        }
        console.log("Stream finished.");

    } catch (error) {
        console.error("❌ STREAM ERROR:", error);
    }
};

testStreaming();
