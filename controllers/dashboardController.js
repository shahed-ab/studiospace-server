import Studio from "../models/Studio.js";
import Booking from "../models/Booking.js";

// ─── Step 19: GET /api/dashboard/stats ──────────────────────────────────────
// Returns:
// - listingsCount: my studios count
// - myBookingsCount: bookings I made
// - pendingRequestsCount: pending booking requests on my studios
// - earnings: sum of totalPrice for Confirmed and Completed bookings on my studios
export async function getDashboardStats(req, res, next) {
  try {
    const userEmail = req.user.email;

    const [listingsCount, bookingsCount, pendingRequestsCount, earningsAgg] =
      await Promise.all([
        Studio.countDocuments({ ownerEmail: userEmail }),
        Booking.countDocuments({ userEmail }),
        Booking.countDocuments({ ownerEmail: userEmail, status: "Pending" }),
        Booking.aggregate([
          {
            $match: {
              ownerEmail: userEmail,
              status: { $in: ["Confirmed", "Completed"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalPrice" },
            },
          },
        ]),
      ]);

    const earnings = earningsAgg[0]?.total || 0;

    res.json({
      listingsCount,
      myBookingsCount: bookingsCount,
      pendingRequestsCount,
      earnings,
      listings: listingsCount,
      bookings: bookingsCount,
      pendingRequests: pendingRequestsCount,
      totalEarnings: earnings,
    });
  } catch (err) {
    next(err);
  }
}

