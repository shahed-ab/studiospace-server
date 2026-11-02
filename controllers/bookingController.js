import mongoose from "mongoose";
import Studio from "../models/Studio.js";
import Booking from "../models/Booking.js";
import { validateBookingTiming } from "../utils/timeHelpers.js";
import { hasBookingConflict } from "../utils/bookingHelpers.js";

// ─── Step 15 & 16: POST /api/bookings ────────────────────────────────────────
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

// ─── Step 17: GET /api/bookings/my ───────────────────────────────────────────
// Returns user's bookings, newest first
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ userEmail: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// ─── Step 17: GET /api/bookings/host ─────────────────────────────────────────
// Returns bookings on host's studios, newest first
export async function getHostBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ ownerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// ─── Step 17: PATCH /api/bookings/:id/cancel ─────────────────────────────────
// Booking owner only, only while Pending
export async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Only pending bookings can be cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

// ─── Step 18: PATCH /api/bookings/:id/status ─────────────────────────────────
// Studio owner only. Allowed transitions:
// Pending -> Confirmed, Cancelled
// Confirmed -> Completed, Cancelled
// On Confirm: re-runs overlap check against other Confirmed bookings (excluding itself)
export async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedTransitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Completed", "Cancelled"],
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${booking.status} to ${status}`,
      });
    }

    // On Confirm: check for conflict with other Confirmed bookings (excluding this booking)
    if (status === "Confirmed") {
      const conflict = await hasBookingConflict(
        booking.studioId,
        booking.date,
        booking.startTime,
        booking.endTime,
        booking._id
      );
      if (conflict) {
        return res.status(409).json({
          message: "This time slot is already booked. Please choose another time.",
        });
      }
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
}
