import { User } from "./auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const authService = {
  async register(userData) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) throw new Error("Email already registered");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({ ...userData, password: hashedPassword });
    await user.save();

    // Auto-generate token after registration
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return { token, user: { id: user._id, name: user.name } };
  },

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return {
      token,
      user: { id: user._id, name: user.name, role: user.role },
    };
  },
};
