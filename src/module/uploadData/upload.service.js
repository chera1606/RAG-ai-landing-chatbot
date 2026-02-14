import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document } from "@langchain/core/documents";
import mongoose from "mongoose";

export const uploadService = {
  async processFile(file) {
    try {
      const blob = new Blob([file.buffer]);
      const loader =
        file.mimetype === "application/pdf"
          ? new PDFLoader(blob)
          : new TextLoader(blob);
      const docs = await loader.load();
      return await this.saveToVectorStore(docs, file.originalname);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async processRawText(text) {
    try {
      const docs = [
        new Document({ pageContent: text, metadata: { source: "manual" } }),
      ];
      return await this.saveToVectorStore(docs, "Manual Entry");
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async saveToVectorStore(docs, source) {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 700,
        chunkOverlap: 60,
      });
      const splitDocs = await splitter.splitDocuments(docs);
      const collection = mongoose.connection.db.collection("documents");

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-embedding-001",
      });

      await MongoDBAtlasVectorSearch.fromDocuments(splitDocs, embeddings, {
        collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
      });
      return { success: true, message: `✅ Synced to Gemini: ${source}` };
    } catch (error) {
      console.error("Gemini Upload Error:", error.message);
      return { success: false, error: error.message };
    }
  },
};
