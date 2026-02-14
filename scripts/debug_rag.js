
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const debugRag = async () => {
    try {
        console.log("1. Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_DB);
        console.log("✅ Connected.");

        const collection = mongoose.connection.db.collection("documents");

        // Check if documents exist
        const count = await collection.countDocuments();
        console.log(`2. Checking collection... Found ${count} documents.`);

        if (count === 0) {
            console.error("❌ No documents found. Please upload a file first via the Dashboard.");
            process.exit(1);
        }

        console.log("3. Generating Embeddings for testing...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-embedding-001",
        });

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection,
            indexName: "vector_index", // Must match Atlas
            textKey: "text",
            embeddingKey: "embedding",
        });

        const query = "ASTU";
        console.log(`4. Running Vector Search for: "${query}"...`);

        const results = await vectorStore.similaritySearch(query, 3);

        if (results.length === 0) {
            console.warn("⚠️ Search returned 0 results. Check your Atlas Vector Search Index 'vector_index' configuration!");
            console.warn("Ensure dimensions: 768 and path: 'embedding'");
        } else {
            console.log("✅ Search successful! Top result:");
            console.log(results[0].pageContent.substring(0, 200) + "...");
        }

        process.exit(0);

    } catch (error) {
        console.error("❌ RAG DEBUG ERROR:", error);
        process.exit(1);
    }
};

debugRag();
