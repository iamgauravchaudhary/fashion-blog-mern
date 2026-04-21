import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wardrobe",
    },
  ],
  image: String,
  occasion: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Outfit", outfitSchema);
