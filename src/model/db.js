import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }, // This will store the 768 numbers
  metadata: { type: Object },
});

export const Data = mongoose.model("Data", DataSchema);
