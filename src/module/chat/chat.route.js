import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = Router();

// List chat summaries and fetch a single conversation
router.get("/", verifyToken, chatController.getUserChats);
router.get("/:id", verifyToken, chatController.getChatDetails);

export default router;
