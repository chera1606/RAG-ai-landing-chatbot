
// import fetch from "node-fetch"; // Use global fetch in Node 24
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testApi = async () => {
    try {
        console.log("1. Generating Test Token...");
        // Create a dummy user token
        const token = jwt.sign(
            { id: "65c3f9b2e4b0a1c2d3e4f5a6", role: "user" }, // Valid hex ObjectId
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("2. Sending Request to /api/rag/query...");
        const response = await fetch("http://localhost:5019/api/rag/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query: "ASTU" })
        });

        console.log(`3. Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Error Body:", text);
            return;
        }

        console.log("4. Reading Stream...");
        // Node-fetch stream handling
        for await (const chunk of response.body) {
            process.stdout.write(chunk.toString());
        }
        console.log("\n✅ Stream Complete.");

    } catch (error) {
        console.error("❌ API TEST ERROR:", error);
    }
};

testApi();
