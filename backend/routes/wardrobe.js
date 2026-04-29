import express from "express";
import WardrobeModel from "../models/Wardrobe.js";

const router = express.Router();

/* =====================
   WARDROBE - ADD ITEM
===================== */

router.post("/", async (req, res) => {
  try {
    const { name, category, color, season, image } = req.body;
    const userId = req.userId;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const item = await WardrobeModel.create({
      userId,
      name,
      category,
      color,
      season,
      image,
    });

    res.json(item);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add wardrobe item" });
  }
});

/* =====================
   WARDROBE - GET ALL ITEMS
===================== */

router.get("/", async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const items = await WardrobeModel.find({ userId })
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wardrobe" });
  }
});

/* =====================
   WARDROBE - DELETE ITEM
===================== */

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ VALIDATE USER ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const itemId = req.params.id;

    // ✅ Verify user owns the item
    const item = await WardrobeModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this item" });
    }

    await WardrobeModel.findByIdAndDelete(itemId);

    res.json({ message: "Item deleted", item });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;