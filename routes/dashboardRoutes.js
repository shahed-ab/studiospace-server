import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// Protected dashboard stats
router.get("/stats", verifyJWT, getDashboardStats);

export default router;

