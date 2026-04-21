import mongoose from "mongoose";

const savedOutfitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  outfitData: {
    title: String,
    name: String,
    description: String,
    styleTip: String,
    items: mongoose.Schema.Types.Mixed, // Can be object with {top, bottom, shoes, accessory} or array of ObjectIds
    colors: [String],
    category: String,
    season: String,
    image: String,
    occasion: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SavedOutfit", savedOutfitSchema);
