import dotenv from "dotenv";
dotenv.config();

import { ConnectDB } from "../src/config/mongo.js";
import mongoose from "mongoose";

async function getTextFromDoc(doc) {
  return (
    doc.text ||
    doc.pageContent ||
    doc.page_content ||
    doc.content ||
    doc.page ||
    doc._id?.toString?.() ||
    ""
  );
}

(async () => {
  try {
    await ConnectDB();
    const db = mongoose.connection.db;
    const collection = db.collection("documents");

    // Determine target dimension by requesting one embedding
    let genAI;
    try {
      ({ genAI } = await import("../src/config/genAI.js"));
    } catch (err) {
      console.error("genAI client not available. Install @google/genai first.");
      process.exit(1);
    }

    const sampleResp = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: ["Hello world"],
      config: { taskType: "RETRIEVAL_DOCUMENT" },
    });
    const targetDim = sampleResp?.embeddings?.[0]?.values?.length;
    if (!targetDim) {
      console.error("Failed to determine target embedding dimension.");
      process.exit(1);
    }
    console.log("Target embedding dimension:", targetDim);

    // Find documents that need updating
    const cursor = collection.find({
      $or: [
        { embedding: { $exists: false } },
        {
          $expr: {
            $ne: [{ $size: { $ifNull: ["$embedding", []] } }, targetDim],
          },
        },
      ],
    });

    let updated = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const text = await getTextFromDoc(doc);
      if (!text || text.length === 0) {
        console.log("Skipping doc (no text):", doc._id?.toString?.());
        continue;
      }

      try {
        const resp = await genAI.models.embedContent({
          model: "gemini-embedding-001",
          contents: [text],
          config: { taskType: "RETRIEVAL_DOCUMENT" },
        });
        const vec = resp?.embeddings?.[0]?.values;
        if (Array.isArray(vec) && vec.length === targetDim) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { embedding: vec } },
          );
          updated++;
          console.log("Updated doc:", doc._id?.toString?.(), "->", vec.length);
        } else {
          console.warn(
            "Embedding not returned for doc:",
            doc._id?.toString?.(),
          );
        }
      } catch (err) {
        console.error(
          "Embedding error for doc",
          doc._id?.toString?.(),
          err?.message || err,
        );
      }

      // small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`Repair complete. Documents updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error("Repair script error:", err);
    process.exit(1);
  }
})();
