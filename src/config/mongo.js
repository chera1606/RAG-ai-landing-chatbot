import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    // CHANGED: Match the name in your .env
    const uri = process.env.MONGO_DB;

    if (!uri) {
      throw new Error("MONGO_DB variable is missing in .env file!");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ DATABASE CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DATABASE ERROR: ${error.message}`);
  }
};
