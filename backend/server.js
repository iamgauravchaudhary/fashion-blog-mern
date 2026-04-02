import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

/* =====================
   MongoDB
===================== */


mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* =====================
   USER SCHEMA
===================== */

const UserSchema = new mongoose.Schema({
  name: String,
  age: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

/* =====================
   CHAT SCHEMA
===================== */

const ChatSchema = new mongoose.Schema({
  userId: String,
  message: String,
  reply: String,
});

const Chat = mongoose.model("Chat", ChatSchema);

/* =====================
   SIGNUP
===================== */

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, age, email, password } = req.body;

    const user = await User.create({
      name,
      age,
      email,
      password,
    });

    res.json({
      userId: user._id,
    });

  } catch (err) {
    res.status(500).json({
      error: "signup error",
    });
  }
});

/* =====================
   LOGIN
===================== */

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      password,
    });

    if (!user) {
      return res.json({
        error: "invalid",
      });
    }

    res.json({
      userId: user._id,
    });

  } catch (err) {
    res.status(500).json({
      error: "login error",
    });
  }
});

/* =====================
   GET USER
===================== */

app.get("/auth/user/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({
      error: "user not found",
    });
  }
});

/* =====================
   GEMINI
===================== */

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

app.post("/chat", async (req, res) => {
  try {
    const { message, userId = "guest" } =
      req.body;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

    const result =
      await model.generateContent(
        "You are fashion AI: " + message
      );

    const reply =
      result.response.text();

    await Chat.create({
      userId,
      message,
      reply,
    });

    res.json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "Error",
    });
  }
});

/* =====================
   SERVER
===================== */

app.listen(5000, () => {
  console.log(
    "Server running http://localhost:5000"
  );
});