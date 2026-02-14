import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth
  googleId: { type: String },
  role: { type: String, default: "user" }, // Default to user
});

export const User = mongoose.model("User", userSchema);
export default User;
