import { Router } from "express";
import { createSession, logout, getMe } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.post("/session", createSession);
router.post("/logout", logout);
router.get("/me", verifyJWT, getMe);

export default router;

