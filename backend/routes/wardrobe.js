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
    const item = await WardrobeModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted", item });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;