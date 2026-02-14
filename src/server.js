// ================================
// 1. ALWAYS LOAD DOTENV FIRST
// ================================
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ================================
// 2. NOW IMPORT EVERYTHING ELSE
// ================================
import express from "express";
import cors from "cors";
import expressLayouts from "express-ejs-layouts";
import { ConnectDB } from "./config/mongo.js";
import router from "./route.js";
import ragRouter from "./module/rag/rag.route.js"; // ✅ RAG ROUTER

// ================================
// APP INIT
// ================================
const app = express();

// ================================
// SYSTEM STARTUP CHECK
// ================================
console.log("------------------------------------------");
console.log("🔍 SYSTEM STARTUP CHECK");
console.log("MONGO_DB Found:", process.env.MONGO_DB ? "YES ✅" : "NO ❌");
console.log("JWT_SECRET Found:", process.env.JWT_SECRET ? "YES ✅" : "NO ❌");
console.log(
  "GEMINI_API_KEY Found:",
  process.env.GEMINI_API_KEY ? "YES ✅" : "NO ❌",
);
console.log("------------------------------------------");

// ================================
// SAFETY CHECK
// ================================
if (!process.env.JWT_SECRET || !process.env.MONGO_DB) {
  console.error("❌ CRITICAL ERROR: Essential .env variables are missing.");
  process.exit(1);
}

// ================================
// CONFIG
// ================================
const PORT = process.env.PORT || 5011;

// ================================
// DATABASE CONNECTION
// ================================
ConnectDB();

// ================================
// MIDDLEWARE
// ================================
import passport from "./config/passport.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

// ================================
// VIEW ENGINE
// ================================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");

// ================================
// ROUTES
// ================================

// API Routes
app.use("/api", router); // Auth routes (login/register)
app.use("/api/rag", ragRouter); // ✅ RAG routes (/api/rag/query)

// Frontend Routes
app.get("/", (req, res) => res.render("index"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/admin", (req, res) => res.render("admin"));

// ================================
// SERVER START
// ================================
app.listen(PORT, () => {
  console.log(`🚀 SERVER LIVE: http://localhost:${PORT}`);
});
