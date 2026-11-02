import mongoose from "mongoose";
import Studio from "../models/Studio.js";
import Booking from "../models/Booking.js";
import { validateBookingTiming } from "../utils/timeHelpers.js";
import { hasBookingConflict } from "../utils/bookingHelpers.js";

// ─── Step 15 & 16: POST /api/bookings ────────────────────────────────────────
// Validates studio existence, ownership, date/time constraints, computes server-side price,
// ensures no collision with Confirmed bookings (409), and saves as Pending.
export async function createBooking(req, res, next) {
  try {
    const { studioId, date, startTime, endTime } = req.body;

    if (!studioId || !mongoose.isValidObjectId(studioId)) {
      return res.status(400).json({ message: "Valid studioId is required" });
    }

    const timing = validateBookingTiming(date, startTime, endTime);
    if (timing.error) {
      return res.status(400).json({ message: timing.error });
    }

    const studio = await Studio.findById(studioId).lean();
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    // A user cannot book their own studio
    if (studio.ownerEmail === req.user.email) {
      return res.status(400).json({ message: "You cannot book your own studio" });
    }

    // Step 16: Double-booking prevention against Confirmed bookings
    const conflict = await hasBookingConflict(studioId, date, startTime, endTime);
    if (conflict) {
      return res.status(409).json({
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    const { hours } = timing;
    const totalPrice = hours * studio.hourlyRate;

    const booking = await Booking.create({
      studioId: studio._id,
      studioTitle: studio.title,
      studioImage: studio.images?.[0] || "",
      userEmail: req.user.email,
      userName: req.user.name,
      ownerEmail: studio.ownerEmail,
      date,
      startTime,
      endTime,
      hours,
      totalPrice,
      securityDeposit: studio.securityDeposit || 0,
      status: "Pending",
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

