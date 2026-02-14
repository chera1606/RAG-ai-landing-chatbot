import { Router } from "express";
import { ragController } from "./rag.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = Router();

// This line MUST only have verifyToken. If you see isAdmin, DELETE IT.
router.post("/query", verifyToken, ragController.query);

router.get("/history", verifyToken, ragController.getUserChats);
router.get("/history/:id", verifyToken, ragController.getChatDetails);

export default router;
