// Run: node scripts/make-bridge-token.js <email> <name>
// Prints a 2-minute bridge token for testing the auth flow before the client exists.
import "dotenv/config";
import jwt from "jsonwebtoken";

const [, , email, ...nameParts] = process.argv;
const name = nameParts.join(" ");

if (!email || !name) {
  console.error("Usage: node scripts/make-bridge-token.js <email> <name>");
  process.exit(1);
}

const token = jwt.sign(
  { email, name, photoURL: "" },
  process.env.AUTH_BRIDGE_SECRET,
  { algorithm: "HS256", expiresIn: "2m" }
);

console.log("\nBridge token (expires in 2 minutes):\n");
console.log(token);
console.log();

