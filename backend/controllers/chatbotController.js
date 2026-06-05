// backend/controllers/chatbotController.js
import { getGeminiReply } from '../utils/gemini.js';

const SYSTEM_PROMPT = `You are "TutorBot", a friendly assistant for the website. 
- Answer concisely and politely.
- If user asks site-specific questions (how to signup, where to find X) answer with short step-by-step guidance.
- If user asks for technical or medical advice, politely disclaim and provide general guidance.
- When asked "contact support", provide the generic support steps: "Go to contact page or email support@example.com".
`;

/**
 * POST /api/chatbot/message
 * body: { message: string, history?: [{ role: 'user'|'assistant', content: string }] }
 */
export async function postMessage(req, res) {
  try {
    console.log("📨 [ChatbotController] Received request");
    console.log("📦 [ChatbotController] Body:", JSON.stringify(req.body, null, 2));
    
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      console.warn("⚠️ [ChatbotController] Invalid message:", message);
      return res.status(400).json({ success: false, message: 'message required' });
    }

    console.log("✅ [ChatbotController] Message validated:", message.substring(0, 50) + "...");
    console.log("📜 [ChatbotController] History items:", history?.length || 0);

    // Build conversation context from history
    let conversationContext = '';
    if (history && Array.isArray(history) && history.length > 0) {
      console.log("📝 [ChatbotController] Adding history to context");
      conversationContext = '\n\nPrevious conversation:\n';
      history.forEach((msg, idx) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        conversationContext += `${role}: ${msg.content}\n`;
        console.log(`  [${idx + 1}] ${role}: ${msg.content.substring(0, 40)}...`);
      });
    }

    // Build full user message with conversation history
    const fullUserMessage = conversationContext ? `${conversationContext}\nUser: ${message}` : message;
    
    console.log("🔧 [ChatbotController] Full message to send:");
    console.log("  System prompt length:", SYSTEM_PROMPT.length);
    console.log("  User message length:", fullUserMessage.length);

    // Get reply from Gemini
    console.log("🚀 [ChatbotController] Calling getGeminiReply...");
    const botText = await getGeminiReply(SYSTEM_PROMPT, fullUserMessage);

    console.log("✅ [ChatbotController] Got response from Gemini, length:", botText.length);
    return res.json({ success: true, data: { reply: botText } });
  } catch (err) {
    console.error('❌ [ChatbotController] Error occurred:', err.message || err);
    console.error('📍 [ChatbotController] Full error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
