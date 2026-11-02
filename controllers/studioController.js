import mongoose from "mongoose";
import Studio from "../models/Studio.js";

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

