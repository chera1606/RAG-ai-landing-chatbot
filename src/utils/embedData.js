import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getGeminiEmbedding(textOrChunks) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    if (Array.isArray(textOrChunks)) {
      const responses = [];
      for (const chunk of textOrChunks) {
        const result = await model.embedContent(chunk);
        responses.push(result.embedding.values);
        if (textOrChunks.length > 1) await sleep(1500); // Wait to avoid Quota Error
      }
      return { success: true, data: responses };
    } else {
      const result = await model.embedContent(textOrChunks);
      return { success: true, vector: result.embedding.values };
    }
  } catch (error) {
    console.error("Embedding Error:", error);
    return { success: false, error: error.message };
  }
}
