// Convert "HH:mm" time string to minutes from 00:00
export function timeToMinutes(timeStr) {
  if (typeof timeStr !== "string") return NaN;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeStr);
  if (!match) return NaN;
  const [, h, m] = match;
  return Number(h) * 60 + Number(m);
}

// Check whether two time intervals [startA, endA) and [startB, endB) in minutes overlap
// Overlap condition: startA < endB && endA > startB
export function isOverlapping(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// Validate booking timing constraints:
// - Date must match YYYY-MM-DD and not be in the past
// - Times must be HH:mm
// - End time must be after start time
// - Duration must be at least 1 hour (60 min) in 30-minute intervals
export function validateBookingTiming(date, startTime, endTime) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "date must be in YYYY-MM-DD format" };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (date < todayStr) {
    return { error: "Booking date cannot be in the past" };
  }

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (isNaN(startMin)) {
    return { error: "startTime must be in valid 24h format (HH:mm)" };
  }
  if (isNaN(endMin)) {
    return { error: "endTime must be in valid 24h format (HH:mm)" };
  }

  if (endMin <= startMin) {
    return { error: "endTime must be after startTime" };
  }

  const durationMin = endMin - startMin;
  if (durationMin < 60) {
    return { error: "Booking duration must be at least 1 hour" };
  }

  if (durationMin % 30 !== 0) {
    return { error: "Booking duration must be in 30-minute increments" };
  }

  const hours = durationMin / 60;
  return { startMin, endMin, hours };
}

