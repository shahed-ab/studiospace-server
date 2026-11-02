// 404 handler — no route matched
export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
}

// Central error handler — catches anything passed to next(err)
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status).json({ message });
}

