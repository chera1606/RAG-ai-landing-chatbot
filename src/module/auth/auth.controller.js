import jwt from "jsonwebtoken";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req, res) {
    try {
      const data = await authService.register(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async googleCallback(req, res) {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const userData = JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      // Redirect with token and user data in query params
      res.redirect(`/?token=${token}&user=${encodeURIComponent(userData)}`);
    } catch (err) {
      console.error(err);
      res.redirect("/login?error=Google_Login_Failed");
    }
  },
};
