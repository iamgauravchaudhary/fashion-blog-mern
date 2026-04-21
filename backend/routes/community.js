import express from "express";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

const router = express.Router();

/* =====================
   COMMUNITY - CREATE POST
===================== */
router.post("/", async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.userId;

    console.log("📥 Incoming file:", req.file ? `${req.file.mimetype} (${req.file.size} bytes)` : "No file");

    // ✅ Handle image from multer file upload
    if (!req.file) {
      return res.status(400).json({
        error: "Image is required",
      });
    }

    // ✅ Convert file buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // ✅ CREATE POST
    const post = await PostModel.create({
      userId,
      image: base64Image,
      caption: caption || "",
      likes: [],
      comments: [],
      saves: [],
    });

    await post.populate("userId", "name avatar");

    res.json(post);

  } catch (err) {
    console.error("❌ CREATE POST ERROR:", err.message);

    res.status(500).json({
      error: "Failed to create post",
      debug: err.message,
    });
  }
});

/* =====================
   COMMUNITY - GET ALL POSTS
===================== */

router.get("/", async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("userId", "name avatar email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

/* =====================
   COMMUNITY - LIKE POST
===================== */

router.post("/:id/like", async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("userId", "name avatar");

    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

/* =====================
   COMMUNITY - SAVE POST
===================== */

router.post("/:id/save", async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Toggle save
    if (post.saves.includes(userId)) {
      post.saves = post.saves.filter(id => id.toString() !== userId.toString());
    } else {
      post.saves.push(userId);
    }

    await post.save();
    await post.populate("userId", "name avatar");

    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
});

/* =====================
   COMMUNITY - GET SAVED POSTS (FOR USER)
===================== */

router.get("/saved/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await PostModel.find({ saves: userId })
      .populate("userId", "name avatar email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
});

/* =====================
   COMMUNITY - ADD COMMENT
===================== */

router.post("/:id/comment", async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;
    const { text } = req.body;

    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);

    post.comments.push({
      userId,
      username: user.name,
      text,
    });

    await post.save();
    await post.populate("userId", "name avatar");

    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/* =====================
   COMMUNITY - DELETE POST
===================== */
router.delete("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;