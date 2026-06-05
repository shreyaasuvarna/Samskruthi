import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("🔧 [Gemini] Initializing with API key:", 
  process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : "NOT SET"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiReply = async (systemPrompt, userMessage) => {
  try {
    console.log("🤖 [Gemini] Getting reply");
    console.log("  System prompt length:", systemPrompt.length);
    console.log("  User message:", userMessage);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    console.log("✅ [Gemini] Model created successfully");

    // Combine system prompt and user message
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    console.log("🚀 [Gemini] Calling generateContent with combined prompt");

    const result = await model.generateContent(fullPrompt);

    console.log("✅ [Gemini] Response received");

    const text = result.response.text();
    console.log("✅ [Gemini] Text extracted, length:", text.length);

    return text;

  } catch (error) {
    console.error("❌ [Gemini] Error occurred:", error.message);
    console.error("📍 [Gemini] Full error:", error);
    throw error;
  }
};
