import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

// Full path: /api/auth/register
router.post("/register", authController.register);

// Full path: /api/auth/login
router.post("/login", authController.login);

export default router;
