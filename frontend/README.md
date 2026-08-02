# ResumeAI Online — Frontend

React 19 + Vite 7 SPA for [resumeaionline.in](https://www.resumeaionline.in) — AI Resume Builder & ATS Checker.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env   # then fill in your values

# Start development server
npm run dev            # → http://localhost:5173
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `/dist`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all source files |

## 🔑 Environment Variables

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🏗️ Key Directories

```
src/
├── components/     # Navbar, Footer, SEO
├── pages/          # All route-level page components
├── context/        # AuthContext + ProtectedRoute
├── features/       # CanvaToolbar (resume builder sidebar)
├── services/       # api.js — all Axios API calls
└── firebase.js     # Firebase app init
```

## 🚢 Deployment

Deployed on **Vercel**. `vercel.json` handles SPA routing (all routes → `index.html`).

```bash
vercel          # deploy from CLI
# or connect GitHub for auto-deploy on push to main
```

See the [root README](../README.md) for the full project documentation.
