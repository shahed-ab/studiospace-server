import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Studio from "../models/Studio.js";

// ─── Step 20: GET /api/wishlist ─────────────────────────────────────────────
// Returns all studios on the user's wishlist, newest first
export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ userEmail: req.user.email })
      .populate("studioId")
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// ─── Step 20: POST /api/wishlist/:studioId ──────────────────────────────────
// Idempotent addition: creates if not present, returns existing if already wishlisted
export async function addToWishlist(req, res, next) {
  try {
    const { studioId } = req.params;

    if (!mongoose.isValidObjectId(studioId)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const studio = await Studio.findById(studioId).lean();
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const item = await Wishlist.findOneAndUpdate(
      { userEmail: req.user.email, studioId },
      { $setOnInsert: { userEmail: req.user.email, studioId } },
      { upsert: true, new: true }
    );

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// ─── Step 20: DELETE /api/wishlist/:studioId ────────────────────────────────
export async function removeFromWishlist(req, res, next) {
  try {
    const { studioId } = req.params;

    if (!mongoose.isValidObjectId(studioId)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    await Wishlist.deleteOne({ userEmail: req.user.email, studioId });
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
}

