import mongoose from "mongoose";

export const ConnectDB = async (retries = 5) => {
  const uri = process.env.MONGO_DB;

  if (!uri) {
    console.error("❌ MONGO_DB variable is missing in .env file!");
    process.exit(1);
  }

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
      });
      console.log(`✅ DATABASE CONNECTED: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries--;
      console.error(`❌ DATABASE ERROR: ${error.message}. Retries left: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      // Wait for 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};
