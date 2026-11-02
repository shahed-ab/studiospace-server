import Booking from "../models/Booking.js";
import { timeToMinutes, isOverlapping } from "./timeHelpers.js";

// Check if a time slot overlaps any Confirmed booking for the same studio and date.
// Overlap rule in minutes: newStart < existingEnd && newEnd > existingStart.
// excludeBookingId is used when updating status of an existing booking in step 18.
export async function hasBookingConflict(studioId, date, startTime, endTime, excludeBookingId = null) {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const query = {
    studioId,
    date,
    status: "Confirmed",
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const confirmedBookings = await Booking.find(query).lean();

  for (const b of confirmedBookings) {
    const existingStart = timeToMinutes(b.startTime);
    const existingEnd = timeToMinutes(b.endTime);
    if (isOverlapping(newStart, newEnd, existingStart, existingEnd)) {
      return true;
    }
  }

  return false;
}

