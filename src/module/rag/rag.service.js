import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export const ragService = {
  async streamChat(query, res) {
    try {
      const collection = mongoose.connection.db.collection("documents");

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-embedding-001",
      });

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
      });

      // Retrieve top 3 relevant chunks
      const docs = await vectorStore.asRetriever(3).invoke(query);

      // Strict RAG: If no docs found, return fallback
      if (!docs || docs.length === 0) {
        res.write("I actually don't know the answer to that based on the available documents.");
        res.end();
        return;
      }

      const contextText = [
        ...new Set(docs.map((d) => d.pageContent.trim())),
      ].join("\n\n");

      const chatModel = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-2.5-flash",
        streaming: true,
      });

      const messages = [
        new SystemMessage(
          `You are an AI assistant for ASTU. You must answer ONLY based on the provided context. 
          If the answer is not in the context, say "I don't have enough information to answer that." 
          Do not make up facts.
          
          Context:
          ${contextText}`
        ),
        new HumanMessage(query),
      ];

      const stream = await chatModel.stream(messages);
      for await (const chunk of stream) {
        if (chunk?.content) res.write(chunk.content);
      }
      res.end();
    } catch (error) {
      console.error("RAG ERROR:", error.message);
      if (!res.writableEnded) res.write("Error: " + error.message);
      res.end();
    }
  },
};
