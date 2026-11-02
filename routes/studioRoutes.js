import { Router } from "express";
import {
  listStudios,
  categoryStats,
  getStudio,
  createStudio,
  updateStudio,
  deleteStudio,
  getStudioAvailability,
} from "../controllers/studioController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// Public
router.get("/",                     listStudios);
router.get("/stats/categories",     categoryStats); // must be before /:id
router.get("/:id/availability",     getStudioAvailability);
router.get("/:id",                  getStudio);

// Protected
router.post("/",        verifyJWT, createStudio);
router.put("/:id",     verifyJWT, updateStudio);
router.delete("/:id",  verifyJWT, deleteStudio);

export default router;
