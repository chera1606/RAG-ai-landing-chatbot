
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const listModels = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Just to init

        // There isn't a direct "listModels" on the instance in some versions, 
        // but let's try to hit the API or just test a few common names.

        console.log("Testing common model names...");

        const modelsToTest = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.0-pro",
            "gemini-1.0-pro-001",
            "gemini-pro",
            "gemini-pro-vision"
        ];

        for (const modelName of modelsToTest) {
            process.stdout.write(`Testing ${modelName}: `);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                const result = await m.generateContent("Hello");
                console.log("✅ OK");
            } catch (e) {
                console.log("❌ Failed (" + e.message.split("\n")[0] + ")");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
};

listModels();
