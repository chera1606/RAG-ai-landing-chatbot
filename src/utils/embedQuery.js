import { client } from "../config/genAI.js";

export const embedGeneratedQuery = async (query) => {
    try {
        if (!query) {
            return {
                success: false,
                error: "Query is required"
            };
        }

        const model = client.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(query);

        if (!result?.embedding?.values) {
            return {
                success: false,
                error: "Failed to generate query embedding"
            };
        }

        return {
            success: true,
            vector: result.embedding.values
        };

    } catch (error) {
        console.error("Embedding error:", error);
        return {
            success: false,
            error: error?.message || "Unexpected embedding error"
        };
    }
};

