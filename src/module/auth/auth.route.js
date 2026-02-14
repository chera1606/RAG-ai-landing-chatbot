import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

// Full path: /api/auth/register
router.post("/register", authController.register);

// Full path: /api/auth/login
router.post("/login", authController.login);

import passport from "passport";

// ... existing routes ...

// Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    authController.googleCallback
);

export default router;
