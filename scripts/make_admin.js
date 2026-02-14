
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/module/auth/auth.model.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address as an argument.");
        console.log("Usage: node scripts/make_admin.js <email>");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`Success! User ${user.name} (${user.email}) is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

makeAdmin();
