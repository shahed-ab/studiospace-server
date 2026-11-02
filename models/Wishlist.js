import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, trim: true },
    studioId:  { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
  },
  { timestamps: true, collection: "wishlists" }
);

// Compound unique index so a user cannot wishlist the same studio more than once
wishlistSchema.index({ userEmail: 1, studioId: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);

