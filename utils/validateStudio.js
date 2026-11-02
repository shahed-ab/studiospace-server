const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];
const URL_RE = /^https?:\/\/.+/;

// Validates and normalises studio input.
// Returns { errors: string[] } on failure or { data: object } on success.
export function validateStudio(body) {
  const errors = [];

  // Accept a single `image` string and promote it to images[0]
  let images = Array.isArray(body.images) ? body.images : undefined;
  if (!images && typeof body.image === "string") images = [body.image];

  const title           = typeof body.title === "string" ? body.title.trim() : "";
  const category        = body.category;
  const hourlyRate      = Number(body.hourlyRate);
  const securityDeposit = Number(body.securityDeposit ?? 0);
  const maxCapacity     = Number(body.maxCapacity);
  const location        = typeof body.location === "string" ? body.location.trim() : "";
  const amenities       = Array.isArray(body.amenities) ? body.amenities : [];
  const overview        = typeof body.overview === "string" ? body.overview.trim() : "";

  if (!title || title.length < 3 || title.length > 100) {
    errors.push("title must be 3–100 characters");
  }
  if (!CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  }
  if (isNaN(hourlyRate) || hourlyRate <= 0) {
    errors.push("hourlyRate must be a number greater than 0");
  }
  if (isNaN(securityDeposit) || securityDeposit < 0) {
    errors.push("securityDeposit must be 0 or more");
  }
  if (!Number.isInteger(maxCapacity) || maxCapacity < 1) {
    errors.push("maxCapacity must be an integer of 1 or more");
  }
  if (!location) {
    errors.push("location is required");
  }
  if (amenities.some((a) => typeof a !== "string")) {
    errors.push("amenities must be an array of strings");
  }
  if (!overview || overview.length < 20) {
    errors.push("overview must be at least 20 characters");
  }
  if (!images || images.length === 0 || images.length > 6) {
    errors.push("images must be a non-empty array of up to 6 URLs");
  } else if (images.some((u) => !URL_RE.test(u))) {
    errors.push("images must all be valid http(s) URLs");
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      title,
      category,
      originalLabel: typeof body.originalLabel === "string" ? body.originalLabel.trim() : undefined,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      images,
      amenities: amenities.map((a) => String(a).trim()),
      overview,
    },
  };
}

export { CATEGORIES };

