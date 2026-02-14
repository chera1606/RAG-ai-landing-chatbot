import dotenv from "dotenv";
dotenv.config();

import { ConnectDB } from "../src/config/mongo.js";
import mongoose from "mongoose";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document } from "@langchain/core/documents";

(async () => {
  try {
    await ConnectDB();

    const collection = mongoose.connection.db.collection("documents");

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-embedding-001",
      taskType: "RETRIEVAL_DOCUMENT",
      title: "IndexCreator",
    });

    const docs = [
      new Document({
        pageContent: "__vector_index_creation__",
        metadata: { source: "index-creator" },
      }),
    ];

    console.log(
      "Creating/ensuring vector index via LangChain fromDocuments...",
    );
    await MongoDBAtlasVectorSearch.fromDocuments(docs, embeddings, {
      collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log("Vector index creation attempted.");
    process.exit(0);
  } catch (err) {
    console.error("Index creation error:", err);
    process.exit(1);
  }
})();
