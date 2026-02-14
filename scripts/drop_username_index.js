import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function dropUsernameIndex() {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const usersCollection = db.collection("users");

        // List all indexes
        console.log("\n--- Current Indexes ---");
        const indexes = await usersCollection.indexes();
        indexes.forEach((index) => {
            console.log(JSON.stringify(index, null, 2));
        });

        // Drop the username_1 index if it exists
        try {
            await usersCollection.dropIndex("username_1");
            console.log("\n✅ Successfully dropped username_1 index");
        } catch (err) {
            if (err.code === 27) {
                console.log("\n⚠️  username_1 index does not exist (already dropped)");
            } else {
                throw err;
            }
        }

        // List indexes after dropping
        console.log("\n--- Indexes After Dropping ---");
        const indexesAfter = await usersCollection.indexes();
        indexesAfter.forEach((index) => {
            console.log(JSON.stringify(index, null, 2));
        });

        await mongoose.connection.close();
        console.log("\n✅ Done!");
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

dropUsernameIndex();
