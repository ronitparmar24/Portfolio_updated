# Portfolio API

Backend for [Portfolio_updated](https://github.com/ronitparmar24/Portfolio_updated).
Node.js + Express + MongoDB Atlas. Three endpoints, no ceremony.

| Method | Endpoint            | Purpose                                            |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/api/health`       | Liveness + DB status; also the wake-up ping         |
| POST   | `/api/contact`      | Validate → store message → email notification       |
| GET    | `/api/github/repos` | Cached public repo list (stars, language, activity) |

## Why only three endpoints

The original plan had a `/api/projects` route serving a hardcoded array. That is
an HTTP round trip, a CORS preflight and a cold start to return data that never
changes — and the array still had to be edited by hand. Three projects belong in
the frontend as a `projects.json` file. Build the projects API the day you have a
CMS or an admin panel behind it, not before.

Also skipped: the admin dashboard (use MongoDB Atlas's own data browser), custom
analytics (Cloudflare Web Analytics is one script tag and needs no backend), and
the weather / countries / JSONPlaceholder widgets, which add moving parts to a
portfolio without saying anything about you as an engineer.

## Setup

```bash
cd backend
npm install
cp .env.example .env    # then fill in MONGODB_URI and IP_HASH_SALT
npm run dev
```

Generate a salt:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

MongoDB Atlas: create a free M0 cluster, add a database user, and under Network
Access allow `0.0.0.0/0` (Render does not publish fixed egress IPs on the free
plan). The database name goes at the end of the URI: `.../portfolio?retryWrites=true`.

Email is optional. Leave `RESEND_API_KEY` blank and messages still get stored —
you just have to check the database yourself.

## Verify

```bash
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Hiring","message":"We have an internship opening."}'

curl "http://localhost:5000/api/github/repos?limit=3"
```

The contact route allows 5 submissions per IP per hour, so the sixth curl in an
hour returns 429 — that is the limiter working, not a bug.

## Frontend wiring

Everything in `frontend-snippets/` pastes into the existing repo:

- `contact-form.html` → inside the contact section of `index.html`
- `contact-form.css` → append to `styles.css`
- `contact-form.js` → append to `script.js`, change `YOUR-SERVICE.onrender.com`
- `github-section.js` → optional live repo cards

## Deploy (Render)

New → Web Service → connect the repo:

```
Root Directory:  backend
Build Command:   npm install
Start Command:   npm start
Health Check:    /api/health
```

Environment variables: everything from `.env.example` except `PORT` (Render
injects it). Set `NODE_ENV=production` and `ALLOWED_ORIGINS` to your real
frontend origin — scheme and host, no trailing slash:

```
ALLOWED_ORIGINS=https://ronitparmar24.github.io,https://ronitparmar.dev
```

### The free-tier catch

Free Render services sleep after ~15 minutes idle and take 30–60s to wake. A
recruiter hitting the contact form on a cold instance sees a form that looks
broken. Two mitigations, both already in place:

1. `warmUpApi()` pings `/api/health` on page load, so the instance is usually
   warm before anyone finishes typing.
2. The frontend uses a 20s timeout with a "server is waking up" message rather
   than a generic failure.

For a stronger fix, point a free UptimeRobot monitor at `/api/health` every 10
minutes, or upgrade to Render's paid instance once the portfolio is doing real
work for you.

## Security notes

- `trust proxy` is `1`, not `true`. With `true`, a client can spoof
  `X-Forwarded-For` and walk straight past the rate limiter.
- Raw IPs are never stored — only a salted SHA-256 prefix.
- Repo descriptions are rendered with `textContent`, not `innerHTML`.
- `.env` is gitignored. If a key ever lands in a commit, rotate it; deleting the
  commit does not un-leak it.
