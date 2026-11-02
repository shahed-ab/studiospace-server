import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userName:   { type: String, required: true, trim: true },
  userAvatar: { type: String, default: "" },
  userEmail:  { type: String, required: true, trim: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, required: true, trim: true },
  createdAt:  { type: Date, default: Date.now },
});

const studioSchema = new mongoose.Schema(
  {
    title:           { type: String, required: true, trim: true },
    category:        {
      type: String,
      required: true,
      enum: ["Photo Studio", "Film Stage", "Podcast Lounge", "Music Suite", "Workshop"],
    },
    originalLabel:   { type: String, trim: true },
    hourlyRate:      { type: Number, required: true },
    securityDeposit: { type: Number, required: true, default: 0 },
    maxCapacity:     { type: Number, required: true },
    location:        { type: String, required: true, trim: true },
    images:          [{ type: String }],
    amenities:       [{ type: String }],
    overview:        { type: String, required: true, trim: true },
    ownerName:       { type: String, required: true, trim: true },
    ownerEmail:      { type: String, required: true, trim: true },
    ownerAvatar:     { type: String, default: "" },
    rating:          { type: Number, default: 0 },
    reviewCount:     { type: Number, default: 0 },
    reviews:         [reviewSchema],
  },
  { timestamps: true, collection: "studios" }
);

studioSchema.index({ category: 1 });
studioSchema.index({ hourlyRate: 1 });
studioSchema.index({ rating: -1 });
studioSchema.index({ createdAt: -1 });
studioSchema.index({ title: "text", location: "text" });

export default mongoose.model("Studio", studioSchema);

