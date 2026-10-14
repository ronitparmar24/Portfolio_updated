<div align="center">

# Ronit Parmar — Portfolio

**Full-Stack Developer & Creative Thinker**  
*Building thoughtful digital experiences with performance, accessibility, and modern aesthetics.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Portfolio-d2f96b?style=for-the-badge&logo=vercel&logoColor=111212)](https://github.com/ronitparmar24/Portfolio_updated)
[![GitHub](https://img.shields.io/badge/GitHub-ronitparmar24-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ronitparmar24)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ronit--parmar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ronit-parmar)

---

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Modern_Motion-1572B6?style=flat-square&logo=css3&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Turnstile-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployment-Vercel_Serverless-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

<br />

## 🌟 Highlights & Key Features

- **Dynamic GitHub API Showcase**: Automatically fetches and ranks public repositories with server-side caching (10 min TTL) and token-authenticated requests (5,000 req/hr).
- **Interactive 3D Canvas Sculpture**: Custom mathematical canvas geometry responding to cursor movements and device tilt, capped at 30 FPS with tab-visibility battery saving.
- **"Ask about Ronit" Portfolio Guide**:
  - Non-blocking docked bottom-right panel on desktop (browsable while chatting) and responsive mobile bottom sheet.
  - Factual grounding in curated project code and résumé facts (no fabricated metrics or unconfirmed claims).
  - Multi-turn conversation awareness with server-side history validation and strict resource allowlists.
  - Verified action chips ("Live project", "GitHub source", "Download Résumé", "Contact Ronit"), follow-up suggestions, one-click copy, and quick retry on failure.
  - Powered by Groq Cloud with configurable model fallback (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) under a strict 11-second budget.
- **Enterprise-Grade Contact System**:
  - **MongoDB Atlas** persistence for contact submissions.
  - **Resend** transactional email dispatch directly to the recruiter's inbox.
  - **Cloudflare Turnstile** seamless bot challenge (no annoying puzzle CAPTCHAs).
  - Built-in honeypot trap, IP rate limiting, and double-submission protection.
- **Collapsible "More Builds"**: Smooth animated switch allowing visitors to explore both static flagship repos and dynamic GitHub projects.
- **Interactive Project Dialogs**: Deep-dive project breakdowns with live demos, source links, and feature overviews.
- **Adaptive Theme Engine**: Zero-flash dark/light mode with automatic OS preference detection and `localStorage` persistence.
- **Unified Vercel Architecture**: Static frontend served globally via Edge CDN, with backend routes unified as Serverless Functions (`/api/*`).

---

## 🏗️ Project Architecture

```
ronit-portfolio/
├── api/
│   └── index.js              # Vercel serverless function entrypoint
├── assets/                   # Vector logos, icons, résumé, and images
├── backend/
│   ├── src/
│   │   ├── config/           # Database (Mongoose) & Zod environment configs
│   │   ├── controllers/      # Contact form & GitHub route handlers
│   │   ├── middleware/       # Rate limiting & error handlers
│   │   ├── models/           # MongoDB Contact Message schema
│   │   ├── routes/           # REST endpoints (/health, /contact, /github/repos)
│   │   ├── services/         # GitHub API, Resend mailer, Cloudflare Turnstile
│   │   ├── app.js            # Express application with security middleware
│   │   └── server.js         # Local standalone HTTP server
│   ├── .env.example          # Sample environment variables
│   └── package.json          # Backend-specific package manifest
├── index.html                # Semantic HTML5 single-page portfolio
├── styles.css                # Custom CSS design system, typography, & layouts
├── motion.css                # Micro-interactions, transitions, & toggle styles
├── script.js                 # Portfolio logic, modals, filters, & API integration
├── motion.js                 # 3D canvas sculpture & cursor parallax physics
├── vercel.json               # Serverless rewrites & deployment configuration
└── package.json              # Root manifest for Vercel dependency resolution
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** `v20.0.0` or higher
- **npm** `v10.0.0` or higher
- Python 3 (or any static HTTP server like Live Server / http-server)

### 1. Clone the repository

```bash
git clone https://github.com/ronitparmar24/Portfolio_updated.git
cd Portfolio_updated
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```bash
cp backend/.env.example backend/.env
```

Fill in your configuration:

```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Database
MONGODB_URI=your_mongodb_connection_string
MONGODB_DBNAME=portfolio

# Email Notifications (Resend)
RESEND_API_KEY=your_resend_api_key
OWNER_EMAIL=ronitparmar.work@gmail.com
FROM_EMAIL=Portfolio <onboarding@resend.dev>

# GitHub API
GITHUB_USERNAME=ronitparmar24
GITHUB_TOKEN=your_github_personal_access_token

# Cloudflare Turnstile (Optional)
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
IP_HASH_SALT=your_random_salt_string_here
```

### 3. Install Dependencies & Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API will start at `http://localhost:5000`. You can test health at `http://localhost:5000/api/health`.

### 4. Serve the Frontend

In a separate terminal at the project root:

```bash
# Using Python
python -m http.server 8080

# Or using Node npx
npx serve . -p 8080
```

Open your browser at **`http://localhost:8080`**.

---

## ☁️ Deployment to Vercel

This repository is pre-configured with `vercel.json` and a serverless `api/` handler to deploy the frontend and backend together in a single Vercel project.

### Step 1: Push Changes
```bash
git add .
git commit -m "feat: complete portfolio setup"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select **`Portfolio_updated`**.
3. Leave **Framework Preset** as `Other` and **Root Directory** as `./`.

### Step 3: Add Environment Variables
Under **Project Settings → Environment Variables**, add:

| Key | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas cluster connection string |
| `MONGODB_DBNAME` | `portfolio` |
| `RESEND_API_KEY` | Resend API key for email delivery |
| `OWNER_EMAIL` | `ronitparmar.work@gmail.com` |
| `FROM_EMAIL` | Verified sender address (e.g. `Portfolio <onboarding@resend.dev>`) |
| `GITHUB_USERNAME` | `ronitparmar24` |
| `GITHUB_TOKEN` | GitHub PAT (fine-grained or classic, public data only) |
| `IP_HASH_SALT` | Random string (min 8 chars) for IP hashing |
| `TURNSTILE_SECRET_KEY` | *(Optional)* Cloudflare Turnstile secret key |

### Step 4: Click **Deploy**
Vercel will build and launch your full-stack portfolio globally within seconds!

---

## 📬 Contact & Connect

- **Portfolio**: [Ronit Parmar](https://ronitparmar24.github.io/Portfolio_updated/)
- **Email**: [ronitparmar.work@gmail.com](mailto:ronitparmar.work@gmail.com)
- **LinkedIn**: [/in/ronit-parmar](https://linkedin.com/in/ronit-parmar)
- **GitHub**: [@ronitparmar24](https://github.com/ronitparmar24)

---

<div align="center">
  <sub>Designed & Developed by Ronit Parmar. All rights reserved.</sub>
</div>