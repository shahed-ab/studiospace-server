import jwt from "jsonwebtoken";

// Reads HTTPOnly cookie `token`, falls back to Authorization: Bearer header.
// Sets req.user = { email, name, photoURL } on success; sends 401 otherwise.
export function verifyJWT(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { email: payload.email, name: payload.name, photoURL: payload.photoURL };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

