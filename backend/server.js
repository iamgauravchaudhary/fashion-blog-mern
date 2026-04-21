import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";

dotenv.config();

// ✅ Dynamic imports for ESM routes
const authRoutes = (await import("./routes/auth.js")).default;
const chatRoutes = (await import("./routes/chat.js")).default;
const wardrobeRoutes = (await import("./routes/wardrobe.js")).default;
const outfitRoutes = (await import("./routes/outfits.js")).default;
const communityRoutes = (await import("./routes/community.js")).default;
const savedOutfitRoutes = (await import("./routes/savedOutfits.js")).default;

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ✅ Multer setup for file uploads (memory storage - no disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// 🔐 JWT_SECRET - CONSISTENT across app
export const JWT_SECRET = process.env.JWT_SECRET || "bhidu_secret_key_default";

console.log("🔐 JWT Secret loaded:", JWT_SECRET ? "✅ Yes" : "❌ No");

// 🔑 Check Gemini API Key
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not found in .env file!");
} else {
  console.log("🔑 Gemini API Key loaded: ✅ Yes");
}

// ✅ MongoDB CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// 🔐 AUTH MIDDLEWARE - Token verification
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️  No auth header or invalid format");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      console.warn("⚠️  Empty token");
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;

    console.log("✅ Token verified for user:", decoded.userId);
    next();
  } catch (err) {
    console.error("🔐 Token verification error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(401).json({ error: "Authentication failed" });
  }
};

// ✅ HEALTHCHECK
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "StyleVibe backend is running ✅" });
});

// ✅ ROUTE MOUNTING - All routing is handled by these module routers
app.use("/auth", authRoutes);
app.use("/api/chat", authMiddleware, chatRoutes);
app.use("/wardrobe", authMiddleware, wardrobeRoutes);
app.use("/outfits", authMiddleware, outfitRoutes);
app.use("/posts", authMiddleware, upload.single("image"), communityRoutes);
app.use("/saved", authMiddleware, savedOutfitRoutes);

// ✅ SERVER STARTUP
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 All routes mounted and ready`);
});