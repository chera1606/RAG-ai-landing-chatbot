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
};
