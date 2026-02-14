import { ragService } from "./rag.service.js";
import { Conversation } from "./chat.model.js";
export const ragController = {
  async query(req, res) {
    try {
      const { query, conversationId } = req.body;
      const userId = req.user.id; // From verifyToken middleware

      // Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      // Call the service
      await ragService.streamChat(query, userId, conversationId, res);
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // These handle the history routes you have in your file
  async getUserChats(req, res) {
    try {
      const chats = await ragService.getHistory(req.user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getChatDetails(req, res) {
    try {
      const chat = await ragService.getChatDetails(req.params.id, req.user.id);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
