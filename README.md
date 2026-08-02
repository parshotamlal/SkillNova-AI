<div align="center">

# 🤖 ResumeAI Online

### AI-Powered Resume Builder, ATS Checker & Career Growth Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-resumeaionline.in-2563eb?style=for-the-badge)](https://www.resumeaionline.in)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)

**ResumeAI Online** is a full-stack, AI-powered platform that helps job seekers — from freshers to senior professionals — create ATS-optimized resumes, check their ATS score, generate cover letters, and get real-time AI feedback. Trusted by 100,000+ job seekers in India, USA, UK, Canada & Australia.

[🚀 Try it Live](https://www.resumeaionline.in) · [🐛 Report a Bug](https://github.com/parshotamlal/SkillNova-AI/issues) · [💡 Request Feature](https://github.com/parshotamlal/SkillNova-AI/issues)

</div>

---

## ✨ Features

### 🧠 AI Resume Analyzer
- Upload your resume (PDF / DOCX) and paste a job description
- Get an **ATS match score (0–100%)** with a visual circular progress indicator
- **Matched & Missing Skills** — exactly which keywords you have vs. what's missing
- **AI-powered improvement suggestions** — actionable, role-specific recommendations
- **9-point ATS Compatibility Checklist:**
  - ✅ Contact information presence
  - ✅ Standard section headers (Experience, Education, Skills)
  - ✅ No tables, columns, or text boxes
  - ✅ Minimal special characters
  - ✅ Employment dates present
  - ✅ Action verbs in bullet points
  - ✅ Sufficient text content (200+ words)
  - ✅ No personal photo or date of birth
  - ✅ Plain-text parseable format

### 📝 AI Resume Builder
- **Canva-style editor** with sidebar tabs — Content, Design, Skills, Templates
- **50+ ATS-friendly resume templates** — Professional, Modern, Creative, Technical, Minimal
- **Live preview panel** — resume updates in real-time as you type
- **AI Content Generator** — writes professional summaries and work experience bullets
- **Dark / Light mode** toggle
- **Multi-section support** — Contact, Summary, Experience, Education, Skills, Projects, Certifications
- **One-click PDF export** — high-quality, ATS-optimized PDF (no watermark on free plan)

### 🎯 ATS Resume Checker
- Upload resume → get your **ATS score in 30 seconds** — no sign-up required
- 95%+ accuracy simulating Taleo, Workday, iCIMS, Greenhouse ATS systems
- Section-by-section breakdown with specific, actionable fixes
- Re-analyze after edits to track score improvement

### ✉️ Cover Letter Generator
- Generates a professional, personalized cover letter based on your resume and job description
- Export as PDF or copy to clipboard with one click

### 👤 User Accounts & Profiles
- Firebase + JWT dual authentication system
- Save and manage multiple resumes from your dashboard
- View past analysis history and scores

### 💳 Subscription & Payments
- Stripe-powered Free + Premium plans
- Secure checkout flow with webhook-verified payment confirmation

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 7 | Build tool & dev server |
| **React Router DOM** | 7 | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **GSAP** | 3.15 | Premium animations & micro-interactions |
| **Lucide React** | 0.525 | Icon library |
| **React Helmet Async** | 3.0 | Dynamic per-page SEO meta tags |
| **jsPDF + html2canvas** | latest | PDF generation & export |
| **Firebase** | 12 | User authentication |
| **Axios** | 1.10 | HTTP client |
| **Stripe.js** | 7 | Payment processing |
| **vite-plugin-sitemap** | 0.8 | Auto-generated XML sitemap |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js + Express** | 5.1 | REST API server |
| **MongoDB + Mongoose** | 8.16 | Database & ODM |
| **Google Generative AI** | 0.24 | Gemini AI for resume analysis |
| **OpenAI SDK** | 5.8 | Fallback AI provider |
| **JWT + bcryptjs** | latest | Auth tokens & password hashing |
| **Multer** | 2.0 | Resume file upload handling |
| **pdfjs-dist** | 5.3 | PDF text extraction |
| **Mammoth** | 1.9 | DOCX text extraction |
| **Stripe** | 18 | Payment gateway & webhooks |
| **cookie-parser** | 1.4 | HTTP cookie parsing |
| **Nodemon** | latest | Dev server hot-reload |

---

## 📁 Project Structure

```
SkillNova-AI/
├── frontend/                         # React + Vite SPA
│   ├── public/
│   │   ├── SkillNova-Logo.png        # App logo / favicon
│   │   └── robots.txt               # SEO crawl directives
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky navbar with GSAP animations
│   │   │   ├── Footer.jsx            # SEO-crawlable footer with all page links
│   │   │   └── SEO.jsx              # Universal SEO component (7 JSON-LD schemas)
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page — hero, features, FAQs, testimonials
│   │   │   ├── template.jsx          # Canva-style AI Resume Builder (50+ templates)
│   │   │   ├── Analyze.jsx           # Resume + JD upload for full AI analysis
│   │   │   ├── Result.jsx            # Analysis results (ATS score, skills, AI rewrite)
│   │   │   ├── AtsResumeAnalyze.jsx  # ATS score checker (file upload mode)
│   │   │   ├── AtsResult.jsx         # ATS score results display
│   │   │   ├── Pricing.jsx           # Free vs Premium plan comparison
│   │   │   ├── Login.jsx             # Firebase authentication — login
│   │   │   ├── Signup.jsx            # Firebase authentication — register
│   │   │   ├── Profile.jsx           # User dashboard & saved resume history
│   │   │   ├── HelpCenter.jsx        # FAQ & support documentation
│   │   │   ├── PrivacyPolicy.jsx     # GDPR-compliant privacy policy
│   │   │   ├── TermsofService.jsx    # Terms & conditions
│   │   │   ├── Status.jsx            # API & service uptime monitor
│   │   │   ├── Success.jsx           # Payment success confirmation
│   │   │   ├── AboutUs.jsx           # About the product & team
│   │   │   └── NotFound.jsx          # Custom 404 (noindex, no crawl waste)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global auth state (user session)
│   │   │   └── ProtectedRoute.jsx    # Auth guard for private routes
│   │   ├── features/
│   │   │   └── CanvaToolbar.jsx      # Resume builder sidebar toolbar
│   │   ├── services/
│   │   │   └── api.js               # Axios API calls (analyze, profile, AI)
│   │   ├── firebase.js              # Firebase app initialization
│   │   ├── App.jsx                  # Root app — routes + providers
│   │   ├── main.jsx                 # React DOM entry point
│   │   └── index.css                # Global base styles
│   ├── index.html                   # HTML shell — SEO meta, OG, Twitter Cards, hreflang
│   ├── vite.config.js               # Vite + sitemap plugin (10 public routes)
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── vercel.json                  # Vercel SPA routing + security headers
│   └── package.json
│
└── backend/                         # Node.js + Express REST API
    ├── config/
    │   └── db.js                    # MongoDB connection setup
    ├── middleware/
    │   └── authMiddleware.js        # JWT token verification
    ├── models/
    │   └── User.js                  # User schema (name, email, plan, history)
    ├── routes/
    │   ├── authRoutes.js            # POST /register, /login, /logout
    │   ├── analyze.js               # POST /analyze, /ats-score/file
    │   ├── profile.js               # GET/PUT /profile
    │   └── Stripe.js                # POST /checkout (Stripe sessions)
    ├── utils/                       # Helper utilities
    ├── server.js                    # Express app entry — CORS, routes, health check
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher
- **MongoDB** — local or [MongoDB Atlas](https://cloud.mongodb.com) free tier
- **Google Gemini API Key** — [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **Firebase Project** — [console.firebase.google.com](https://console.firebase.google.com)
- **Stripe Account** — [dashboard.stripe.com](https://dashboard.stripe.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/parshotamlal/SkillNova-AI.git
cd SkillNova-AI
```

#### 🔧 Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create and configure your .env file (see variables below)
# Then start the development server with hot reload
npm run server

# Or for production
npm start
```

Backend runs at: **http://localhost:8000**

#### ⚛️ Frontend Setup

```bash
# Open a new terminal tab from the project root
cd frontend

# Install dependencies
npm install

# Create and configure your .env file (see variables below)
# Then start the development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
# ── Server ─────────────────────────────────────────────────────────────
PORT=8000

# ── Database ───────────────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/resumeai
# For MongoDB Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/resumeai

# ── Authentication ─────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# ── AI Services ────────────────────────────────────────────────────────
AI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here          # Optional fallback

# ── Payments ───────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ── CORS ───────────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
# ── API ────────────────────────────────────────────────────────────────
VITE_API_URL=http://localhost:8000

# ── Firebase ───────────────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# ── Stripe ─────────────────────────────────────────────────────────────
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

> ⚠️ **Never commit `.env` files to Git.** They are already in `.gitignore`.

---

## 🌐 API Routes Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user account |
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT in cookie |
| `POST` | `/api/auth/logout` | ✅ | Logout — clears auth cookie |

### Resume Analysis — `/api/analyze`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/analyze` | ✅ | Full AI analysis — resume vs job description |
| `POST` | `/api/analyze/ats-score/file` | ✅ | ATS score check via file upload (PDF/DOCX) |

### Profile — `/api/profile`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/profile` | ✅ | Get current user profile & resume history |
| `PUT` | `/api/profile` | ✅ | Update profile information |

### Payments — `/api/stripe`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/stripe/checkout` | ✅ | Create Stripe checkout session for premium |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API health check — returns "API is running" |
| `GET` | `/health` | Health check for uptime monitors & cron jobs |

---

## 📄 Pages Overview

| Route | Page | Access |
|---|---|---|
| `/` | Home — Hero, features, testimonials, FAQ | Public |
| `/templates` | AI Resume Builder — 50+ templates, live editor | Public |
| `/analyze` | Resume Analyzer — Upload resume + job description | Login required |
| `/result` | Analysis Results — ATS score, skills, AI rewrite | Login required |
| `/check-ats-score` | ATS Checker — Quick file-upload ATS score | Login required |
| `/ats-result` | ATS Score Results — Detailed breakdown | Login required |
| `/pricing` | Pricing — Free vs Premium plans | Login required |
| `/login` | Login page | Public |
| `/signup` | Signup page | Public |
| `/profile` | User Dashboard — saved resumes & history | Login required |
| `/help-center` | Help Center — FAQ & support docs | Public |
| `/Privacy-Policy` | Privacy Policy — GDPR compliant | Public |
| `/Terms-of-Service` | Terms of Service | Public |
| `/status` | API & service status monitor | Public |

---

## 📊 ATS Compatibility Score Guide

| Score Range | Verdict | Meaning |
|---|---|---|
| **80–100%** | ✅ Excellent | High chance of passing automated screening |
| **60–79%** | 🟡 Good | Minor keyword or formatting improvements needed |
| **40–59%** | 🟠 Fair | Significant issues with keywords or structure |
| **Below 40%** | 🔴 Poor | Resume likely auto-rejected by ATS software |

---

## 📦 PDF Export Options

| Export | What's Included |
|---|---|
| **Analysis Report** | Full report: score, skills breakdown, AI suggestions, ATS checklist |
| **AI-Rewritten Resume** | Clean, ATS-formatted version of your optimized resume |
| **Cover Letter** | Professionally formatted, role-specific cover letter |
| **Resume Builder Export** | High-quality PDF from the template builder — no watermark |

---

## 🔍 SEO Architecture

ResumeAI Online is built with production-grade SEO:

- **Dynamic meta tags** per route via `react-helmet-async` (title, description, keywords)
- **7 JSON-LD schema types** auto-injected on relevant pages:
  - `Organization`, `WebSite + SearchAction`, `SoftwareApplication`
  - `FAQPage`, `HowTo`, `BreadcrumbList`, `AggregateRating`
- **Open Graph** + **Twitter Card** tags on every single page
- **Hreflang** for 5 target regions: `en-IN`, `en-US`, `en-GB`, `en-CA`, `en-AU`
- **Auto-generated sitemap.xml** via `vite-plugin-sitemap` covering all public routes
- **Robots.txt** — private/dashboard routes blocked, CSS/JS assets allowed for rendering
- **Non-blocking font loading** — reduced from 7 font families to 2 (`Inter` + `Syne`)
- **Canonical URLs** on every page to prevent duplicate content penalties
- **noindex** on 404, login, signup, and private pages to save crawl budget

---

## 🚢 Deployment

### Frontend — Vercel (Recommended)

```bash
# Option 1: Vercel CLI
npm i -g vercel
cd frontend
vercel

# Option 2: GitHub Integration
# Connect your repo at vercel.com → auto-deploys on every push to main
```

> `vercel.json` is pre-configured with SPA routing (all routes → `index.html`) and security headers.

**Production environment variables** must be added in the Vercel dashboard:  
Project → Settings → Environment Variables

### Backend — Railway / Render / VPS

```bash
# Railway
npm i -g @railway/cli
railway login
railway up

# Render: Connect GitHub → Build Command: npm install → Start: npm start
```

### Database — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist your server IP (or `0.0.0.0/0` for all)
3. Copy the connection URI to `MONGO_URI` in your backend environment

---

## 🤝 Contributing

Contributions are welcome! Here's the workflow:

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/SkillNova-AI.git

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make changes, then commit using Conventional Commits
git commit -m "feat: add linkedin profile optimizer"

# 4. Push and open a Pull Request
git push origin feat/your-feature-name
```

### Commit Convention

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `seo:` | SEO or metadata improvement |
| `perf:` | Performance improvement |
| `docs:` | Documentation only |
| `style:` | CSS / visual changes |
| `refactor:` | Code restructure (no feature change) |
| `chore:` | Build, deps, config |

Please **open an issue** first to discuss major changes before submitting a PR.

---

## 📃 License

This project is licensed under the **[MIT License](LICENSE)** — free to use, modify, and distribute with attribution.

---

## 👤 Author

**Parshotam Lal** — Builder of ResumeAI Online

| Platform | Link |
|---|---|
| 🌐 Website | [resumeaionline.in](https://www.resumeaionline.in) |
| 💼 LinkedIn | [linkedin.com/in/parshotamlal](https://www.linkedin.com/in/parshotamlal) |
| 🐙 GitHub | [github.com/parshotamlal](https://github.com/parshotamlal) |
| 🐦 Twitter/X | [@parshotamsinghx](https://twitter.com/parshotamsinghx) |
| 📧 Email | parshotamworks@gmail.com |

---

<div align="center">

Built with ❤️ by **Parshotam Lal** — helping job seekers compete at the highest level.

⭐ **Star this repo** if it helped you!

</div>
