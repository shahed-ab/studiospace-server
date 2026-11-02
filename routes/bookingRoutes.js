import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  cancelBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// Protected routes
router.post("/",           verifyJWT, createBooking);
router.get("/my",          verifyJWT, getMyBookings);
router.get("/host",        verifyJWT, getHostBookings);
router.patch("/:id/cancel", verifyJWT, cancelBooking);
router.patch("/:id/status", verifyJWT, updateBookingStatus);

export default router;
