import jwt from "jsonwebtoken";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Cookie options differ between production and local to support cross-site requests on Vercel
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    maxAge: SEVEN_DAYS_MS,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
}

// POST /api/auth/session
// Accepts a short-lived bridge token signed by AUTH_BRIDGE_SECRET (created server-side
// by the client after BetterAuth confirms a real session). Never trust plain body fields.
export function createSession(req, res) {
  const { bridgeToken } = req.body;

  if (!bridgeToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let payload;
  try {
    payload = jwt.verify(bridgeToken, process.env.AUTH_BRIDGE_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, name, photoURL } = payload;

  // Issue our own long-lived JWT
  const token = jwt.sign({ email, name, photoURL }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, cookieOptions());
  return res.json({ user: { email, name, photoURL } });
}

// POST /api/auth/logout
export function logout(req, res) {
  res.clearCookie("token", cookieOptions());
  return res.json({ message: "Logged out" });
}

// GET /api/auth/me  (protected — verifyJWT already ran)
export function getMe(req, res) {
  return res.json({ user: req.user });
}

