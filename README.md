# SkillNova AI 🎯
 
**SkillNova AI** is an intelligent resume analysis platform evaluating resumes using AI and ATS-based techniques. It delivers real-time feedback on skills, keyword optimization, and resume quality to maximize your job selection chances.
 
---
 
## ✨ Features
 
- **ATS Match Scoring** — Compares your resume against a job description and returns a percentage match score with a visual circular progress indicator.
- **Matched & Missing Skills** — Instantly identifies which skills from the job description are present in your resume and which are missing.
- **Improvement Suggestions** — AI-generated, actionable recommendations to strengthen your application.
- **ATS Compatibility Check** — Independent 9-point checklist that evaluates your resume's ATS-readability regardless of the job description:
  - Contact information presence
  - Standard section headers
  - No tables or columns
  - Minimal special characters
  - Employment dates
  - Action verbs in bullets
  - Sufficient text content
  - No personal photo or DOB
  - Plain text parseable format
- **AI Resume Rewriter** — Rewrites your resume for maximum ATS readability, tailored to the job description.
- **Cover Letter Generator** — Generates a professional, personalized cover letter based on your resume and target job.
- **PDF Downloads** — Export the full analysis report, ATS-optimized resume, or cover letter as a PDF.
- **Copy to Clipboard** — One-click copy for the rewritten resume and cover letter.
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React, React Router DOM |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| PDF Generation | jsPDF |
| AI Services | Custom API (`services/api.js`) |
 
---
 
## 📁 Project Structure
 
```
src/
├── pages/
│   └── Result.jsx          # Main analysis results page
├── services/
│   └── api.js              # API calls for resume rewrite & cover letter
└── ...
```
 
---
 
## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB (local or cloud instance)
- Google Gemini API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skillnova-ai.git

# Navigate into the project
cd skillnova-ai

# Setup Backend
cd backend
cp .env.example .env
# Edit .env with your actual values
npm install
npm start

# Setup Frontend (in a new terminal)
cd ../frontend
cp .env.example .env
# Edit .env with your actual values
npm install
npm run dev
```

**Note:** Make sure to copy and configure the `.env.example` files in both `backend/` and `frontend/` directories before starting the servers.
 
---
 
## 📄 Pages Overview
 
### `/analyze`
Upload your resume and paste the job description to begin analysis.
 
### `/result`
Displays the full analysis including:
- ATS match score
- Matched and missing skills
- Improvement suggestions
- ATS compatibility checklist
- AI-rewritten resume (on demand)
- Generated cover letter (on demand)
---
 
## 📊 ATS Compatibility Scoring
 
The ATS compatibility check runs **9 independent checks** on your resume text and returns a verdict:
 
| Score | Verdict |
|---|---|
| 80%+ | ✅ Excellent |
| 60–79% | 🟡 Good |
| 40–59% | 🟠 Fair |
| Below 40% | 🔴 Poor |
 
---
 
## 📦 PDF Exports
 
| Export | Description |
|---|---|
| Analysis Report | Full report with score, skills, suggestions, and ATS checks |
| ATS Resume | Clean, ATS-formatted version of the rewritten resume |
| Cover Letter | Professionally formatted cover letter PDF |
 
---
 
## 🔑 Environment Variables

### Backend (.env)
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8000

# Database
MONGO_URI=mongodb://localhost:27017/skillnova

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# AI Service (Google Gemini)
AI_API_KEY=your_google_gemini_api_key_here
```

### Frontend (.env)
Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
```

**Note:** Copy the respective `.env.example` files to `.env` and update with your actual values.
 
---
 
## 🤝 Contributing
 
Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.
 
---
 
## 📃 License
 
This project is licensed under the [MIT License](LICENSE).
 
---
 
> Built with ❤️ by the SkillNova AI team — helping candidates compete at the highest level.
