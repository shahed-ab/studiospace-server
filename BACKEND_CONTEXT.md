# StudioSpace Server — Backend Context (FINAL)

Read this whole file at the start of EVERY task. It is the single source of truth for the backend. If a task conflicts with it, tell me before doing it.

StudioSpace is a peer-to-peer marketplace for renting creative studios (Photo Studio, Film Stage, Podcast Lounge, Music Suite, Workshop). This folder is ONLY the Express API and its own git repo. Never touch or look at the client folder. I am a beginner on Windows (PowerShell): keep code simple, explain results plainly, and give PowerShell-friendly commands.

**Quality bar:** production-style but readable code a beginner can explain. Correct HTTP status codes, clear JSON errors, validated input, no dead code, no extra docs, no tests unless asked.

---

## 1. Stack (fixed)

Node.js + **JavaScript (NOT TypeScript)**, Express.js, MongoDB with Mongoose, jsonwebtoken, cookie-parser, cors, dotenv. ES modules (`"type": "module"`). nodemon as a dev dependency. Do not install other packages without asking.
npm scripts: `dev` (nodemon server.js), `start` (node server.js), `seed` (node scripts/seed.js).
Structure: `server.js`, `config/db.js`, `models/`, `routes/`, `controllers/`, `middleware/`, `utils/`, `scripts/seed.js`, `scripts/make-bridge-token.js`.
Files required: `.gitignore` (node_modules, .env), `.env.example` (names only).

## 2. Environment variables

`PORT` (default 5000), `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `AUTH_BRIDGE_SECRET`, `CLIENT_URL` (one or several comma-separated origins, no trailing slashes). The `.env` file already exists and is filled in. NEVER print, log, or commit its contents.

## 3. Hosting: Vercel (serverless)

The server will be deployed on Vercel as a serverless function, so:
- `server.js` must `export default app` (default export of the Express app).
- Only call `app.listen` when NOT on Vercel: `if (!process.env.VERCEL) { app.listen(PORT, ...) }`.
- MongoDB connects LAZILY with a cached connection: `config/db.js` keeps the connection promise in a module-level variable and reuses it. A small middleware at the top of `server.js` awaits that connection before each request. Never open a new connection per request. Locally, the same code must also work with `npm run dev`.
- No in-memory state, no files on disk, no background timers. Do not add `vercel.json` unless strictly needed.

## 4. Authentication model (follow exactly)

Users register and log in on the **client** with BetterAuth (email/password + Google) using the MongoDB adapter. BetterAuth owns the `user`, `session`, `account` and `verification` collections in the SAME database. **This server never handles passwords and never creates users.**

The server protects its API with its own JWT in an **HTTPOnly cookie**:

- `POST /api/auth/session` — body `{ bridgeToken }`. The client's server-side code signs the bridge token only after BetterAuth confirms a real session. Verify it with `AUTH_BRIDGE_SECRET` (HS256); payload has `email`, `name`, `photoURL`; it expires in at most 5 minutes. Missing, invalid or expired: 401. NEVER trust an email, name or photo sent in a plain request body. On success sign the server JWT with `JWT_SECRET` (payload `email`, `name`, `photoURL`; expires in 7 days) and set cookie `token`: `httpOnly: true`, `path: "/"`, `maxAge` 7 days; in production `secure: true` + `sameSite: "none"`, otherwise `secure: false` + `sameSite: "lax"`. Return `{ user }`.
- `POST /api/auth/logout` — clears the cookie with the same options. Return success.
- `GET /api/auth/me` — protected. Returns the user from the token.
- `verifyJWT` middleware — reads cookie `token` (fallback: `Authorization: Bearer`), verifies with `JWT_SECRET`, sets `req.user = { email, name, photoURL }`. Otherwise responds **401** `{ "message": "Unauthorized" }`.
- `scripts/make-bridge-token.js <email> <name>` prints a 2-minute bridge token so the flow can be tested before the client auth exists.

CORS: origins from `CLIENT_URL`, `credentials: true`, methods GET POST PUT PATCH DELETE OPTIONS, headers Content-Type and Authorization. `app.set("trust proxy", 1)`. Use `cookie-parser` and `express.json()` with a sensible limit.

## 5. Models (Mongoose, timestamps on)

**Studio** (collection `studios`): `title`, `category` (enum: Photo Studio, Film Stage, Podcast Lounge, Music Suite, Workshop), `originalLabel`, `hourlyRate`, `securityDeposit`, `maxCapacity`, `location`, `images[]` (URLs), `amenities[]`, `overview`, `ownerName`, `ownerEmail`, `ownerAvatar`, `rating` (default 0), `reviewCount` (default 0), `reviews[{ userName, userAvatar, userEmail, rating, comment, createdAt }]`.

**Booking** (collection `bookings`): `studioId` (ref Studio), `studioTitle`, `studioImage`, `userEmail`, `userName`, `ownerEmail`, `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm), `hours`, `totalPrice`, `securityDeposit`, `status` (enum: Pending, Confirmed, Completed, Cancelled; default Pending).

**Wishlist** (optional feature): `userEmail`, `studioId` (ref Studio), unique compound index on `(userEmail, studioId)`.

Indexes: Studio `category`, `hourlyRate`, `rating`, `createdAt`, text index on `title` + `location`; Booking `(studioId, date, status)`, `userEmail`, `ownerEmail`.

## 6. Routes (all under `/api`; JSON errors `{ message }`)

**Public**
- `GET /` and `GET /api/health` — health check.
- `GET /api/studios` — query: `search` (title/location, case-insensitive), `category`, `minPrice`, `maxPrice`, `sort` (`top` = rating desc, `price-asc`, `price-desc`, `newest` = default), `page` (default 1), `limit` (default 9). Respond `{ studios, total, page, pages }`. `limit=6&sort=top` must work for Home's featured section (uses `.limit(6)`).
- `GET /api/studios/stats/categories` — studio count per category. Define BEFORE `/:id`.
- `GET /api/studios/:id` — details. 404 for a missing or invalid ObjectId.
- `GET /api/studios/:id/availability?date=YYYY-MM-DD` — the Confirmed time ranges for that day.

**Protected (verifyJWT; 401 without a valid cookie)**
- `POST /api/studios` — owner fields come from `req.user`, never the body. 201.
- `GET /api/my-studios` — studios where `ownerEmail === req.user.email`.
- `PUT /api/studios/:id` — owner only (403 otherwise). Never allow changing `ownerEmail`, `rating`, `reviewCount`, `reviews`.
- `DELETE /api/studios/:id` — owner only (403). Also delete its wishlist entries.
- `POST /api/bookings` — body `{ studioId, date, startTime, endTime }`. Checks: studio exists; user is not the owner; date not in the past; end after start; duration at least 1 hour in 30-minute steps. Server computes `hours` and `totalPrice` from `hourlyRate` (never trust client prices). **Double-booking prevention:** if the range overlaps any **Confirmed** booking for the same studio and date, respond **409** `"This time slot is already booked. Please choose another time."` Overlap rule in minutes: `newStart < existingEnd && newEnd > existingStart`. Save as `Pending`. 201.
- `GET /api/bookings/my` — the user's bookings, newest first.
- `GET /api/bookings/host` — bookings on my studios, newest first.
- `PATCH /api/bookings/:id/cancel` — booking owner only, only while `Pending`.
- `PATCH /api/bookings/:id/status` — studio owner only. Transitions: Pending to Confirmed or Cancelled; Confirmed to Completed or Cancelled. On Confirm, re-run the overlap check against other Confirmed bookings (exclude itself); 409 on collision.
- `POST /api/studios/:id/reviews` — only users with a Completed booking for that studio, one review per user per studio; recalculate `rating` (average) and `reviewCount`.
- `GET /api/dashboard/stats` — my listings count, bookings I made, pending requests on my studios, earnings (sum of `totalPrice` for Confirmed and Completed on my studios).
- Optional wishlist: `GET /api/wishlist`, `POST /api/wishlist/:studioId` (idempotent), `DELETE /api/wishlist/:studioId`.

## 7. Validation (return 400 naming the failing field)

- `title` 3-100 chars. `category` one of the five values. `hourlyRate` number greater than 0. `securityDeposit` number 0 or more. `maxCapacity` integer 1 or more. `location` required. `amenities` array of strings. `overview` at least 20 chars.
- `images`: non-empty array (max 6) of valid http(s) URLs. Also accept a single `image` string and convert it to `images[0]`. The client uploads files to imgbb itself; the server stores URLs only.
- Validate ObjectIds before querying. Booking date must be real; times must match `HH:mm`.

## 8. Quality and security

- Central error handler and a JSON 404 handler. Never leak stack traces in production.
- Wrap async controllers so errors reach the handler.
- Use `lean()` for read-only queries. Trim strings. Never trust client-sent ownership or price fields.
- Never log secrets. Short plain-English comments on the non-obvious parts (cookie flags, overlap check).

## 9. Seed

`scripts/seed.js` clears and inserts 12 realistic studios. Read `scripts/mock-studios-reference.ts` for titles, categories, prices, locations, images, amenities, overviews and ratings, and match them closely (map design labels onto the five official categories, keep the label in `originalLabel`). Make the owner of the first 4 studios `host@studiospace.demo` (name "Demo Host") so a real demo account can later manage them; use a few other fictional hosts for the rest. Add 2-3 sample reviews to some studios. Print how many were inserted.

## 10. Assignment requirement checklist (all must be true at the end)

- [ ] `POST /api/studios`, `DELETE /api/studios/:id`, `POST /api/bookings` (and every protected route) return **401 Unauthorized** without a valid HTTPOnly cookie (Challenge 1).
- [ ] Overlapping a Confirmed booking returns a clear **409** message (Challenge 2).
- [ ] Studio CRUD with ownership checks; My Listings uses the `ownerEmail` match.
- [ ] Featured studios use `.limit(6)`; filters, sort and pagination work for Explore.
- [ ] Bookings save as `Pending`; cancel works only for Pending.
- [ ] All data lives in MongoDB (`studios`, `bookings`).
- [ ] 20 meaningful git commits on this repo (section 11).
- [ ] Works on Vercel (default export, cached DB connection, env variables).

## 11. Build plan: 20 steps = 20 git commits

I make the commits myself. Build ONE step at a time, in this order:

| # | Step | Commit message |
|---|---|---|
| 1 | package.json (ES modules, scripts), .gitignore, .env.example | `chore: initialize express project with scripts and env template` |
| 2 | config/db.js cached MongoDB connection with Mongoose | `feat: add cached mongodb connection with mongoose` |
| 3 | server.js: Express, CORS, cookie-parser, JSON, trust proxy, health routes, default export | `feat: set up express server with cors and health routes` |
| 4 | Central error handler and 404 handler | `feat: add centralized error and not-found handlers` |
| 5 | middleware/verifyJWT.js | `feat: add jwt cookie verification middleware` |
| 6 | Auth routes (session, logout, me) + scripts/make-bridge-token.js | `feat: add auth session routes and bridge token script` |
| 7 | models/Studio.js with indexes | `feat: add studio model with indexes` |
| 8 | Studio validation helpers (utils) | `feat: add studio input validation` |
| 9 | GET /api/studios (search, category, price, sort, pagination, limit) | `feat: add studio listing with filters sort and pagination` |
| 10 | GET /api/studios/:id and /stats/categories | `feat: add studio details and category stats endpoints` |
| 11 | POST /api/studios and GET /api/my-studios (protected) | `feat: add protected create studio and my studios routes` |
| 12 | PUT and DELETE /api/studios/:id with owner checks | `feat: add studio update and delete with ownership checks` |
| 13 | scripts/seed.js (12 studios) | `feat: add seed script with sample studios` |
| 14 | models/Booking.js + time helpers (HH:mm to minutes, overlap function) | `feat: add booking model and time helpers` |
| 15 | POST /api/bookings with validation and server-side price | `feat: add create booking with price calculation` |
| 16 | Double-booking prevention (409) | `feat: prevent double booking against confirmed bookings` |
| 17 | GET /bookings/my, GET /bookings/host, PATCH /bookings/:id/cancel | `feat: add my bookings host bookings and cancel` |
| 18 | PATCH /bookings/:id/status + GET /studios/:id/availability | `feat: add booking status transitions and availability` |
| 19 | Reviews + GET /dashboard/stats | `feat: add reviews and dashboard stats` |
| 20 | Wishlist model and routes | `feat: add wishlist endpoints` |

Each step touches only the files that belong to it so each commit is clean. If a later step must edit an earlier file (for example mounting a router in server.js), keep the edit tiny and list that file in that step's commit.

## 12. How to work

- Do ONLY the step I ask for. Write each file once. Do not polish or rewrite working files. No docs, no extra tests.
- NEVER run `git commit` or `git push` yourself. Give me the commands.
- Test what the step adds against the real database (install packages and start the server when needed; use curl or a short Node script; PowerShell friendly). Fix failures before reporting.
- After each step, STOP and reply in exactly this format, short, to save tokens:

```
STEP N DONE
What I built: (max 2 lines)
Test result: (what you ran, what came back)
Commit it with:
git add <exact files for this step>
git commit -m "<message from the table>"
```

- Remind me to run `git status` first; `.env` and `node_modules` must never appear in it.
- Wait until I reply "next" before starting the next step.

## 13. Manual actions (important)

Some things I must do myself because you cannot access my accounts: MongoDB Atlas, Google Cloud, imgbb, GitHub, Vercel dashboards, environment variables on hosting, and anything that needs a login or a secret.

Whenever a step needs one of these, or the code will not work until I do something outside the code, STOP and show:

```
YOUR ACTION NEEDED
- What: (one line)
- Where: (exact website, menu and button names)
- Steps: (numbered, for a beginner)
- What to check or give back: (for example "put this in .env", "tell me when done")
```

Never ask me to paste secrets into chat; tell me which file and variable name to use. Never assume I did a manual action; wait for my confirmation. Known manual moments: before Step 2 (MONGODB_URI in .env), after Step 13 (check 12 studios in Atlas, Browse Collections), and at deployment (Vercel project, every environment variable, redeploy, and turning off Vercel Authentication if the API shows a login wall).