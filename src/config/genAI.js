import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️  GEMINI_API_KEY not set - AI features will not work");
}

// Small wrapper to expose a `models.generateContent` helper similar to older SDKs
const client = new GoogleGenerativeAI(apiKey);

export const genAI = {
  client,
  models: {
    // generateContent({ model, contents }) => { text }
    generateContent: async ({ model = "gemini-2.5-flash", contents }) => {
      const m = client.getGenerativeModel({ model });

      // Try several possible generation method names defensively
      let resp;
      const tryCalls = [
        (c) => c.generate?.({ input: contents }),
        (c) => c.generate?.({ text: contents }),
        (c) => c.generateText?.({ input: contents }),
        (c) => c.generateText?.({ text: contents }),
        (c) => c.create?.({ prompt: contents }),
      ];

      for (const fn of tryCalls) {
        try {
          resp = await fn(m);
          if (resp) break;
        } catch (e) {
          // ignore and try next
        }
      }

      // Defensive extraction of text from various response shapes
      let text = "";
      try {
        if (!resp) throw new Error("No response from model");
        if (resp.text) text = resp.text;
        else if (resp.output?.[0]?.content?.[0]?.text)
          text = resp.output[0].content[0].text;
        else if (resp.candidates?.[0]?.content?.[0]?.text)
          text = resp.candidates[0].content[0].text;
        else if (resp.candidates?.[0]?.output?.[0]?.text)
          text = resp.candidates[0].output[0].text;
        else if (typeof resp === "string") text = resp;
      } catch (e) {
        console.warn(
          "Could not extract text from GenAI response",
          e?.message || e,
        );
      }

      return { text };
    },
  },
};
