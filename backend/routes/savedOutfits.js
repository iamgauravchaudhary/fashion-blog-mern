import express from "express";
import SavedOutfitModel from "../models/SavedOutfit.js";
import UserModel from "../models/User.js";

const router = express.Router();

/* =====================
   SAVED OUTFITS - SAVE/CREATE
===================== */

router.post("/", async (req, res) => {
  try {
    const { outfitData } = req.body;
    const userId = req.userId;

    if (!outfitData) {
      return res.status(400).json({ error: "Outfit data required" });
    }

    if (!outfitData.title && !outfitData.name) {
      return res.status(400).json({ error: "Outfit title required" });
    }

    // Ensure proper data structure
    const outfit = {
      title: outfitData.title || outfitData.name,
      name: outfitData.name || outfitData.title,
      description: outfitData.description || outfitData.styleTip,
      styleTip: outfitData.styleTip || outfitData.description,
      items: outfitData.items, // Can be object or array
      colors: outfitData.colors || [],
      category: outfitData.category,
      season: outfitData.season,
      image: outfitData.image,
      occasion: outfitData.occasion || outfitData.category,
    };

    const savedOutfit = await SavedOutfitModel.create({
      userId,
      outfitData: outfit,
      likes: [],
      comments: [],
    });

    await savedOutfit.populate("userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error("❌ Save outfit error:", err.message);
    res.status(500).json({ error: "Failed to save outfit", details: err.message });
  }
});

/* =====================
   SAVED OUTFITS - CREATE (ALIAS)
===================== */

router.post("/add", async (req, res) => {
  try {
    const { outfitData } = req.body;
    const userId = req.userId;

    if (!outfitData || !outfitData.name) {
      return res.status(400).json({ error: "Outfit name required" });
    }

    const savedOutfit = await SavedOutfitModel.create({
      userId,
      outfitData,
      likes: [],
      comments: [],
    });

    await savedOutfit.populate("userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save outfit" });
  }
});

/* =====================
   SAVED OUTFITS - GET USER OUTFITS
===================== */

router.get("/user/:userId", async (req, res) => {
  try {
    const savedOutfits = await SavedOutfitModel.find({ userId: req.params.userId })
      .populate("userId", "name avatar")
      .populate("comments.userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(savedOutfits);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch saved outfits" });
  }
});

/* =====================
   SAVED OUTFITS - DELETE
===================== */

router.delete("/:id", async (req, res) => {
  try {
    const savedOutfit = await SavedOutfitModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Outfit deleted", savedOutfit });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete outfit" });
  }
});

/* =====================
   SAVED OUTFITS - LIKE
===================== */

router.post("/:id/like", async (req, res) => {
  try {
    const userId = req.userId;
    const outfitId = req.params.id;

    const savedOutfit = await SavedOutfitModel.findById(outfitId);

    if (savedOutfit.likes.includes(userId)) {
      savedOutfit.likes = savedOutfit.likes.filter(id => id.toString() !== userId.toString());
    } else {
      savedOutfit.likes.push(userId);
    }

    await savedOutfit.save();
    await savedOutfit.populate("userId", "name avatar").populate("comments.userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like outfit" });
  }
});

/* =====================
   SAVED OUTFITS - LIKE (LEGACY PATH)
===================== */

router.post("/like/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const outfitId = req.params.id;

    const savedOutfit = await SavedOutfitModel.findById(outfitId);

    if (savedOutfit.likes.includes(userId)) {
      savedOutfit.likes = savedOutfit.likes.filter(id => id.toString() !== userId.toString());
    } else {
      savedOutfit.likes.push(userId);
    }

    await savedOutfit.save();
    await savedOutfit.populate("userId", "name avatar").populate("comments.userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like outfit" });
  }
});

/* =====================
   SAVED OUTFITS - ADD COMMENT
===================== */

router.post("/comment/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const outfitId = req.params.id;
    const { text } = req.body;

    const user = await UserModel.findById(userId);
    const savedOutfit = await SavedOutfitModel.findById(outfitId);

    savedOutfit.comments.push({
      userId,
      username: user.name,
      text,
    });

    await savedOutfit.save();
    await savedOutfit.populate("userId", "name avatar").populate("comments.userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/* =====================
   SAVED OUTFITS - DELETE COMMENT
===================== */

router.delete("/comment/:id/:commentId", async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const savedOutfit = await SavedOutfitModel.findByIdAndUpdate(
      id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).populate("userId", "name avatar").populate("comments.userId", "name avatar");

    res.json(savedOutfit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;