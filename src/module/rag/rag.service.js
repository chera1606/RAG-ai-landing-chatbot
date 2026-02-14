import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { Conversation } from "./chat.model.js";

const queryCache = new Map();

// Configuration for models
const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-pro-latest";
const EMBEDDING_MODEL = "gemini-embedding-001";

export const ragService = {
  async streamChat(query, userId, conversationId, res) {
    let conversation;
    try {
      // 1. Check Cache
      const cacheKey = `${userId}:${query}`;
      if (queryCache.has(cacheKey)) {
        console.log(`[RAG] Cache hit: "${query}"`);
        const cachedResponse = queryCache.get(cacheKey);
        res.write(cachedResponse);
        res.end();
        return;
      }

      // 2. Get/Create Conversation
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

      // 3. Save User Message
      conversation.messages.push({ role: "user", content: query });
      await conversation.save();

      const collection = mongoose.connection.db.collection("documents");

      // Shared Config
      const genAIConfig = { apiKey: process.env.GEMINI_API_KEY };

      // Helper for retries with exponential backoff & jitter
      const withRetry = async (fn, retries = 5) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err) {
            const isRateLimit = err.message.includes("429") || err.message.includes("Quota");
            if (i === retries - 1) throw err;

            // Exponential backoff: 2s, 4s, 8s, 16s, 32s + jitter
            const baseWait = isRateLimit ? Math.pow(2, i + 1) * 1000 : 1000;
            const jitter = Math.random() * 1000;
            const waitTime = baseWait + jitter;

            console.warn(`[RAG] ${isRateLimit ? 'Rate limit' : 'Error'} (Attempt ${i + 1}). Retrying in ${(waitTime / 1000).toFixed(1)}s...`);
            await new Promise(r => setTimeout(r, waitTime));
          }
        }
      };

      // 4. Retrieval with Stable Embeddings
      const embeddings = new GoogleGenerativeAIEmbeddings({
        ...genAIConfig,
        modelName: EMBEDDING_MODEL,
      });

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
      });

      console.log(`[RAG] Query: "${query}" | Models: ${PRIMARY_MODEL} / ${EMBEDDING_MODEL}`);

      const docs = await withRetry(() => vectorStore.asRetriever(3).invoke(query));

      if (!docs || docs.length === 0) {
        const fallback = "I don't have enough information in my database to answer that correctly.";
        res.write(fallback);
        res.end();
        conversation.messages.push({ role: "assistant", content: fallback });
        await conversation.save();
        return;
      }

      const contextText = [...new Set(docs.map((d) => d.pageContent.trim()))].join("\n\n");

      // 5. Generation with Model Failover
      const generateResponse = async (modelName) => {
        const chatModel = new ChatGoogleGenerativeAI({
          ...genAIConfig,
          modelName: modelName,
          streaming: true,
          maxRetries: 0,
        });

        const messages = [
          new SystemMessage(`Answering for ASTU. ONLY use provided context. If unknown, say you don't know.\n\nContext:\n${contextText}`),
          new HumanMessage(query),
        ];

        return await chatModel.stream(messages);
      };

      let stream;
      try {
        console.log(`[RAG] Requesting Primary: ${PRIMARY_MODEL}`);
        stream = await withRetry(() => generateResponse(PRIMARY_MODEL), 3);
      } catch (primaryErr) {
        console.error(`[RAG] Primary Model Failed: ${PRIMARY_MODEL}. Trying Fallback...`);
        // Fallback model often has different rate limits
        stream = await withRetry(() => generateResponse(FALLBACK_MODEL), 3);
      }

      let fullResponse = "";
      for await (const chunk of stream) {
        if (chunk?.content) {
          res.write(chunk.content);
          fullResponse += chunk.content;
        }
      }
      res.end();

      // 6. Post-Process
      queryCache.set(cacheKey, fullResponse);
      conversation.messages.push({ role: "assistant", content: fullResponse });
      await conversation.save();
      console.log("[RAG] Success.");

    } catch (error) {
      console.error("CRITICAL RAG ERROR:", error.message);
      const userMsg = error.message.includes("429")
        ? "⚠️ System is very busy. Please wait 1 minute before your next question."
        : "⚠️ An unexpected error occurred. Please try again.";

      if (!res.writableEnded) res.write(userMsg);
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
