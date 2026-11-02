import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    studioId:        { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
    studioTitle:     { type: String, required: true, trim: true },
    studioImage:     { type: String, default: "" },
    userEmail:       { type: String, required: true, trim: true },
    userName:        { type: String, required: true, trim: true },
    ownerEmail:      { type: String, required: true, trim: true },
    date:            { type: String, required: true, trim: true }, // YYYY-MM-DD
    startTime:       { type: String, required: true, trim: true }, // HH:mm
    endTime:         { type: String, required: true, trim: true }, // HH:mm
    hours:           { type: Number, required: true },
    totalPrice:      { type: Number, required: true },
    securityDeposit: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true, collection: "bookings" }
);

bookingSchema.index({ studioId: 1, date: 1, status: 1 });
bookingSchema.index({ userEmail: 1 });
bookingSchema.index({ ownerEmail: 1 });

export default mongoose.model("Booking", bookingSchema);

