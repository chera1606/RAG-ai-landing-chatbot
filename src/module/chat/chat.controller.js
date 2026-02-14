import { Conversation } from "./chat.model.js";

export const chatController = {
  // Get all chat summaries for a user
  async getUserChats(req, res) {
    try {
      const chats = await Conversation.find({ userId: req.user.id })
        .select("title updatedAt")
        .sort({ updatedAt: -1 });
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get full messages for a specific chat
  async getChatDetails(req, res) {
    try {
      const chat = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
