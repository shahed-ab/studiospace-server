import { Router } from "express";
import {
  listStudios,
  categoryStats,
  getStudio,
} from "../controllers/studioController.js";

const router = Router();

// Public routes
router.get("/",                   listStudios);
router.get("/stats/categories",   categoryStats);  // must be before /:id
router.get("/:id",                getStudio);

export default router;

