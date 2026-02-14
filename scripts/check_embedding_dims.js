import dotenv from "dotenv";
dotenv.config();

import { ConnectDB } from "../src/config/mongo.js";
import mongoose from "mongoose";

(async () => {
  try {
    await ConnectDB();

    const db = mongoose.connection.db;
    const collection = db.collection("documents");

    const doc = await collection.findOne({ embedding: { $exists: true } });

    if (doc && Array.isArray(doc.embedding)) {
      console.log("Stored embedding found; length:", doc.embedding.length);
    } else if (doc) {
      console.log(
        "Stored embedding found but not an array. Type:",
        typeof doc.embedding,
      );
    } else {
      console.log("No stored embedding found in 'documents' collection.");
    }

    // Show a sample of up to 10 documents with embedding lengths
    const cursor = collection.find({ embedding: { $exists: true } }).limit(10);
    const samples = await cursor.toArray();
    console.log("Sample embeddings (up to 10):");
    samples.forEach((s, i) => {
      const len = Array.isArray(s.embedding) ? s.embedding.length : null;
      console.log(i + 1 + ") id:", s._id?.toString?.(), "len:", len);
    });

    // Print index info
    const indexes = await collection.indexes();
    console.log("Indexes on 'documents':", indexes);

    // Try to request a fresh embedding from Gemini if the genAI client is available
    try {
      const { genAI } = await import("../src/config/genAI.js");
      const response = await genAI.models.embedContent({
        model: "gemini-embedding-001",
        contents: ["Hello world"],
        config: { taskType: "RETRIEVAL_QUERY" },
      });

      const newVec = response?.embeddings?.[0]?.values;
      console.log(
        "New embedding length (gemini-embedding-001):",
        newVec?.length ?? "none",
      );

      if (doc && Array.isArray(doc.embedding) && newVec) {
        if (doc.embedding.length !== newVec.length) {
          console.log(
            "MISMATCH: stored length",
            doc.embedding.length,
            "vs new length",
            newVec.length,
          );
          console.log(
            "Recommendation: drop/recreate the vector index or re-ingest documents with the current model.",
          );
        } else {
          console.log("Dimensions match. No action needed.");
        }
      }
    } catch (err) {
      console.log(
        "Skipping remote embedding check: genAI client not available or failed to import.",
      );
      console.log(
        "If your query embeddings are different (e.g. 3072), drop/recreate the vector index and re-ingest documents.",
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Check script error:", error);
    process.exit(1);
  }
})();
