import mongoose from "mongoose";
import Studio from "../models/Studio.js";
import Booking from "../models/Booking.js";
import Wishlist from "../models/Wishlist.js";
import { validateStudio } from "../utils/validateStudio.js";

// ─── Step 9: GET /api/studios ────────────────────────────────────────────────
// Supports: search, category, minPrice, maxPrice, sort, page, limit
export async function listStudios(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    const filter = {};

    if (search) {
      // Case-insensitive substring match across title and location
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ title: re }, { location: re }];
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.hourlyRate = {};
      if (minPrice) filter.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) filter.hourlyRate.$lte = Number(maxPrice);
    }

    const sortMap = {
      top:        { rating: -1 },
      "price-asc":  { hourlyRate: 1 },
      "price-desc": { hourlyRate: -1 },
      newest:     { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const skip     = (pageNum - 1) * limitNum;

    const [studios, total] = await Promise.all([
      Studio.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Studio.countDocuments(filter),
    ]);

    res.json({ studios, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

// ─── Step 10: GET /api/studios/stats/categories ──────────────────────────────
// Must be registered BEFORE /:id so Express doesn't treat "stats" as an id
export async function categoryStats(req, res, next) {
  try {
    const stats = await Studio.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    // Shape: [{ category, count }]
    res.json(stats.map((s) => ({ category: s._id, count: s.count })));
  } catch (err) {
    next(err);
  }
}

// ─── Step 10: GET /api/studios/:id ───────────────────────────────────────────
export async function getStudio(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Studio not found" });
    }
    const studio = await Studio.findById(id).lean();
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    res.json(studio);
  } catch (err) {
    next(err);
  }
}

// ─── Step 11: POST /api/studios ──────────────────────────────────────────────
// Owner fields always come from req.user — never from the body.
export async function createStudio(req, res, next) {
  try {
    const { errors, data } = validateStudio(req.body);
    if (errors) return res.status(400).json({ message: errors[0] });

    const studio = await Studio.create({
      ...data,
      ownerName:   req.user.name,
      ownerEmail:  req.user.email,
      ownerAvatar: req.user.photoURL || "",
    });

    res.status(201).json(studio);
  } catch (err) {
    next(err);
  }
}

// ─── Step 11: GET /api/my-studios ────────────────────────────────────────────
export async function myStudios(req, res, next) {
  try {
    const studios = await Studio
      .find({ ownerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(studios);
  } catch (err) {
    next(err);
  }
}

// ─── Step 12: PUT /api/studios/:id ───────────────────────────────────────────
// Owner only; never changes ownerEmail, rating, reviewCount, or reviews.
export async function updateStudio(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const studio = await Studio.findById(id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { errors, data } = validateStudio(req.body);
    if (errors) return res.status(400).json({ message: errors[0] });

    Object.assign(studio, data); // ownerEmail/rating/reviewCount/reviews not in data
    await studio.save();
    res.json(studio);
  } catch (err) {
    next(err);
  }
}

// ─── Step 12: DELETE /api/studios/:id ────────────────────────────────────────
// Owner only. Wishlist cleanup added in step 20 once Wishlist model exists.
export async function deleteStudio(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const studio = await Studio.findById(id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await studio.deleteOne();
    // Step 20: Also delete its wishlist entries
    await Wishlist.deleteMany({ studioId: id });
    res.json({ message: "Studio deleted" });
  } catch (err) {
    next(err);
  }
}

// ─── Step 18: GET /api/studios/:id/availability?date=YYYY-MM-DD ─────────────
// Returns the Confirmed time ranges for that studio and day
export async function getStudioAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    }

    const studio = await Studio.findById(id).lean();
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const confirmedBookings = await Booking.find(
      { studioId: id, date, status: "Confirmed" },
      "startTime endTime date status"
    )
      .sort({ startTime: 1 })
      .lean();

    res.json(confirmedBookings);
  } catch (err) {
    next(err);
  }
}

// ─── Step 19: POST /api/studios/:id/reviews ─────────────────────────────────
// Only users with a Completed booking for that studio, one review per user per studio.
// Recalculates rating (average) and reviewCount.
export async function addStudioReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Studio not found" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const studio = await Studio.findById(id);
    if (!studio) {
      return res.status(404).json({ message: "Studio not found" });
    }

    // Must have a Completed booking for this studio
    const hasCompletedBooking = await Booking.exists({
      studioId: id,
      userEmail: req.user.email,
      status: "Completed",
    });

    if (!hasCompletedBooking) {
      return res.status(403).json({
        message: "You can only review studios you have completed a booking for",
      });
    }

    // One review per user per studio
    const alreadyReviewed = studio.reviews.some(
      (r) => r.userEmail === req.user.email
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this studio",
      });
    }

    studio.reviews.push({
      userName: req.user.name,
      userEmail: req.user.email,
      userAvatar: req.user.photoURL || "",
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date(),
    });

    studio.reviewCount = studio.reviews.length;
    const sum = studio.reviews.reduce((acc, r) => acc + r.rating, 0);
    studio.rating = Number((sum / studio.reviewCount).toFixed(2));

    await studio.save();
    res.status(201).json(studio);
  } catch (err) {
    next(err);
  }
}

