import { Router } from "express";
import { createBooking } from "../controllers/bookingController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// Protected routes
router.post("/", verifyJWT, createBooking);

export default router;

