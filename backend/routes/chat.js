import express from "express";
import axios from "axios";
import ChatModel from "../models/Chat.js";
import UserModel from "../models/User.js";

const router = express.Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "gpt-4o-mini";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY not found in .env file!");
}

// 🎯 Fashion Styling System Prompt
const SYSTEM_PROMPT = `You are an expert AI Fashion Stylist. Your role is to provide personalized outfit recommendations, styling advice, and fashion tips. 

Guidelines:
- Be friendly, encouraging, and fashion-forward
- Provide specific outfit combinations with clothing items
- Consider occasion, season, and style preferences
- Suggest colors, patterns, and accessories
- Keep responses concise (2-4 sentences max)
- Use emojis to make responses engaging
- Focus on practical, wearable advice
- If unsure about context, ask clarifying questions

Always respond as a knowledgeable fashion expert helping someone build their wardrobe.`;

/* =====================
   CHAT ROUTE - WITH OPENROUTER AI
===================== */

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    // 🔐 AUTH CHECK
    if (!userId) {
      return res.status(401).json({
        success: false,
        reply: "Please login again",
      });
    }

    // 📝 MESSAGE VALIDATION
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        reply: "Message cannot be empty",
      });
    }

    // 👤 USER FETCH
    const user = await UserModel.findById(userId).select("preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        reply: "User not found",
      });
    }

    console.log("🎯 Chat request from user:", userId);
    console.log("💬 Message:", message);

    let reply = "";

    /* =====================
       OPENROUTER AI INTEGRATION
    ====================== */

    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      reply = response.data?.choices?.[0]?.message?.content?.trim() || "";

      if (!reply) {
        throw new Error("OpenRouter returned empty content");
      }

      console.log("✅ OpenRouter AI response received");
    } catch (aiError) {
      console.error("⚠️ OpenRouter API error:", aiError.message);

      // ✅ FALLBACK - If OpenRouter fails, use backup logic
      console.log("🔄 Using fallback AI logic...");

      const msg = message.toLowerCase();

      if (msg.includes("outfit")) {
        reply = "🔥 Try this: White shirt + blue jeans + sneakers (clean casual look)";
      }
      else if (msg.includes("weekend")) {
        reply = "😎 Weekend vibe: Oversized t-shirt + cargos + sneakers";
      }
      else if (msg.includes("party")) {
        reply = "✨ Party look: Black shirt + slim fit jeans + boots";
      }
      else if (msg.includes("formal")) {
        reply = "👔 Formal: Light shirt + dark trousers + leather shoes";
      }
      else if (msg.includes("color")) {
        reply = "🎨 Go with black, white, beige — always stylish and safe";
      }
      else if (msg.includes("summer")) {
        reply = "☀️ Summer: Cotton t-shirt + shorts + sneakers";
      }
      else {
        reply = "👕 Ask me about outfits, colors, or styles!";
      }
    }

    /* =====================
       SAVE CHAT TO DATABASE
    ====================== */

    const chatRecord = await ChatModel.create({
      userId,
      message,
      reply,
    });

    console.log("💾 Chat saved:", chatRecord._id);

    /* =====================
       RESPONSE
    ====================== */

    res.json({
      success: true,
      reply,
      chatId: chatRecord._id,
    });

  } catch (err) {
    console.error("❌ CHAT ERROR:", err.message);

    // 🔐 TOKEN ERROR
    if (
      err.message.includes("jwt") ||
      err.message.includes("token") ||
      err.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        reply: "Session expired. Please login again.",
      });
    }

    // ❌ GENERAL ERROR
    res.status(500).json({
      success: false,
      reply: "Something went wrong",
      error: process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
});

/* =====================
   CHAT HISTORY
===================== */

router.get("/history", async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    console.log("📚 Fetching history for:", userId);

    const chats = await ChatModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      chats,
    });

  } catch (err) {
    console.error("❌ HISTORY ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
});

export default router;