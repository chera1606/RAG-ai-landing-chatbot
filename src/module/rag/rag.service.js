import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { Conversation } from "./chat.model.js";

export const ragService = {
  async streamChat(query, userId, conversationId, res) {
    let conversation;
    try {
      // 1. Get or Create Conversation
      if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
      }

      if (!conversation) {
        conversation = new Conversation({
          userId,
          title: query.substring(0, 30) + "...",
          messages: [],
        });
      }

      // 2. Save User Message
      conversation.messages.push({ role: "user", content: query });
      await conversation.save();

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

      console.log(`[RAG] Query: "${query}" | User: ${userId}`);

      // Retrieve top 3 relevant chunks
      const docs = await vectorStore.asRetriever(3).invoke(query);
      console.log(`[RAG] Docs found: ${docs?.length || 0}`);

      // Strict RAG: If no docs found, return fallback
      if (!docs || docs.length === 0) {
        console.warn("[RAG] No documents found. Sending fallback.");
        const fallback = "I actually don't know the answer to that based on the available documents.";
        res.write(fallback);
        res.end();

        // Save Fallback Message
        conversation.messages.push({ role: "assistant", content: fallback });
        await conversation.save();
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

      console.log("[RAG] Starting stream...");
      const stream = await chatModel.stream(messages);
      let fullResponse = "";

      for await (const chunk of stream) {
        // console.log("Chunk received:", chunk); // Debug full chunk
        if (chunk?.content) {
          process.stdout.write("*"); // Log progress char
          res.write(chunk.content);
          fullResponse += chunk.content;
        } else {
          console.log("Empty chunk received");
        }
      }
      console.log("\n[RAG] Response complete.");
      res.end();

      // 4. Save AI Message
      try {
        if (mongoose.connection.readyState !== 1) {
          console.log("[RAG] Connection lost during stream. Reconnecting...");
          await mongoose.connect(process.env.MONGO_DB);
        }

        conversation.messages.push({ role: "assistant", content: fullResponse });
        await conversation.save();
        console.log("[RAG] Conversation saved successfully.");
      } catch (saveError) {
        console.error("[RAG] Failed to save AI response to history:", saveError.message);
      }

    } catch (error) {
      console.error("RAG ERROR:", error); // Log full error object
      if (!res.writableEnded) res.write("Error: " + error.message);
      res.end();
    }
  },

  async getHistory(userId) {
    return await Conversation.find({ userId }).sort({ updatedAt: -1 });
  },

  async getChatDetails(id, userId) {
    return await Conversation.findOne({ _id: id, userId });
  },
};
