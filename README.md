# StudioSpace API

Express + MongoDB REST API for **StudioSpace**, a peer-to-peer marketplace for renting creative studios.

[**Live API**](https://studiospace-server-taupe.vercel.app/api/health) · [**Client Repo**](https://github.com/shahed-ab/studiospace-client) · [**Live Site**](https://studiospace-client-iycx.vercel.app)

## Highlights
- 🔐 **HttpOnly JWT cookie auth.** Every protected route returns `401` without a valid cookie.
- 🚫 **Double-booking prevention.** Overlaps with Confirmed bookings return `409`, checked at booking time and again when a host confirms.
- 🛡️ **Server-side trust.** Prices are computed from the hourly rate, and owners come from the token, never the request body.
- ☁️ **Serverless-ready** on Vercel (cached MongoDB connection, default-exported app).
- ✅ Input validation, ownership checks (`403`), central error handling, no stack traces in production.

## Tech Stack
Node.js, Express, MongoDB, Mongoose, jsonwebtoken, cookie-parser, cors, dotenv

## How authentication works
Users sign in on the client with BetterAuth. The client's server then issues a **2-minute bridge token** signed with `AUTH_BRIDGE_SECRET`. `POST /api/auth/session` verifies it and sets this API's own `token` cookie (HttpOnly, 7 days). The API never handles passwords.

## Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| GET | `/api/studios` | Public | Search, filter, sort, paginate (`limit=6&sort=top` for featured) |
| GET | `/api/studios/stats/categories` | Public | Studio count per category |
| GET | `/api/studios/:id` | Public | Studio details |
| GET | `/api/studios/:id/availability?date=` | Public | Confirmed time ranges for a day |
| POST | `/api/auth/session` | Public | Exchange bridge token for the cookie |
| POST | `/api/auth/logout` | Public | Clear the cookie |
| GET | `/api/auth/me` | 🔒 | Current user |
| POST | `/api/studios` | 🔒 | Create studio |
| GET | `/api/my-studios` | 🔒 | My listings |
| PUT / DELETE | `/api/studios/:id` | 🔒 Owner | Update / delete studio |
| POST | `/api/studios/:id/reviews` | 🔒 | Review (needs a Completed booking) |
| POST | `/api/bookings` | 🔒 | Create booking (`409` on overlap) |
| GET | `/api/bookings/my` | 🔒 | My bookings |
| GET | `/api/bookings/host` | 🔒 | Bookings on my studios |
| PATCH | `/api/bookings/:id/cancel` | 🔒 Booker | Cancel a Pending booking |
| PATCH | `/api/bookings/:id/status` | 🔒 Host | Confirm, complete or cancel |
| GET | `/api/dashboard/stats` | 🔒 | Listings, bookings, earnings |
| GET / POST / DELETE | `/api/wishlist` | 🔒 | Saved studios |

## Setup

```bash
git clone https://github.com/shahed-ab/studiospace-server.git
cd studiospace-server
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
npm run seed              # 12 sample studios
npm run dev               # http://localhost:5000
```

### Environment variables
| Variable | Purpose |
|---|---|
| `PORT` | Local port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs the API's login cookie |
| `AUTH_BRIDGE_SECRET` | Must match the client's value |
| `CLIENT_URL` | Allowed CORS origin(s), no trailing slash |

## Scripts
`npm run dev` · `npm start` · `npm run seed` · `node scripts/make-bridge-token.js <email> <name>` (generates a test token)

## Project Structure
```
server.js         App entry (default export for Vercel)
config/           Cached MongoDB connection
models/           Studio, Booking, Wishlist
routes/           Route definitions
controllers/      Request handlers
middleware/       verifyJWT, error and 404 handlers
utils/            Validation and time/overlap helpers
scripts/          Seed and bridge-token scripts
```
