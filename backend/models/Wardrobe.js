import mongoose from "mongoose";

const wardrobeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"],
    required: true,
  },
  color: String,
  season: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Wardrobe", wardrobeSchema);
