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

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    console.log("📥 Incoming file:", req.file ? `${req.file.mimetype} (${req.file.size} bytes)` : "No file");

    // ✅ VALIDATE FILE
    if (!req.file) {
      return res.status(400).json({
        error: "Image is required",
      });
    }

    // ✅ CHECK FILE TYPE
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
      });
    }

    // ✅ CHECK FILE SIZE (limit to 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "File size too large. Maximum 5MB allowed",
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
   COMMUNITY - GET USER POSTS
===================== */

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log("📸 Fetching posts for user:", userId);

    const posts = await PostModel.find({ userId })
      .populate("userId", "name avatar email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("❌ USER POSTS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

/* =====================
   COMMUNITY - LIKE POST
===================== */

router.post("/:id/like", async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

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

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

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

    // ✅ Validate comment text
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: "Comment too long (max 500 characters)" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      userId,
      username: user.name,
      text: text.trim(),
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
   COMMUNITY - DELETE COMMENT
===================== */
router.delete("/:postId/comment/:commentId", async (req, res) => {
  try {
    const userId = req.userId;
    const { postId, commentId } = req.params;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // ✅ VERIFY OWNERSHIP - allow post owner or comment author to delete
    if (comment.userId.toString() !== userId.toString() && post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();
    await post.populate("userId", "name avatar");

    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

/* =====================
   COMMUNITY - DELETE POST
===================== */
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;