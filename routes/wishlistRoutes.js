import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

// All wishlist routes are protected
router.use(verifyJWT);

router.get("/",            getWishlist);
router.post("/:studioId",   addToWishlist);
router.delete("/:studioId", removeFromWishlist);

export default router;

