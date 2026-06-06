# AI Career Launchpad
This repository contains the backend API for AI Career Launchpad.

## Notes
- This repo includes backend code only.
- The frontend is not included here.
- Use this repo to run the Express API, database schema, and AI / GitHub integrations.

## Features

- **User Authentication** — JWT-based register/login
- **CV Upload & Analysis** — PDF parsing + AI feedback & scoring via Gemini
- **GitHub Integration** — Auto-import projects with AI-generated descriptions
- **Portfolio Generation** — AI-built portfolio
- **Skills Dashboard** — Detect skills from your CV and GitHub
- **Interview Prep** — AI-generated interview questions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| AI | Google Gemini 2.0 Flash (free API) |
| Auth | JWT |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))

---

### 1. Database Setup

```sql
-- Create the database
CREATE DATABASE ai_career_launchpad;

-- Connect and run the schema
\c ai_career_launchpad
\i backend/src/config/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and fill in your values:
#   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ai_career_launchpad
#   JWT_SECRET=your_random_secret_here
#   GEMINI_API_KEY=your_gemini_api_key_here

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

---

## Getting a Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste it into `backend/.env` as `GEMINI_API_KEY`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF + AI analysis |
| GET | `/api/resume` | Get resume & feedback |

### GitHub
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/github/connect` | Connect GitHub username |
| GET | `/api/github` | Get GitHub profile |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/generate` | Generate AI portfolio |
| GET | `/api/portfolio` | Get portfolio |
| PUT | `/api/portfolio` | Update portfolio |
| GET | `/api/portfolio/public/:slug` | Public portfolio view |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Add project + AI desc |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/regenerate` | Regenerate AI description |

---

## Project Structure

```
ai-career-launchpad/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL pool
│   │   │   └── schema.sql        # DB schema
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── resumeController.js
│   │   │   ├── githubController.js
│   │   │   ├── portfolioController.js
│   │   │   └── projectController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   ├── routes/
│   │   │   └── index.js          # All API routes
│   │   ├── services/
│   │   │   ├── geminiService.js  # Gemini AI calls
│   │   │   └── githubService.js  # GitHub API calls
│   │   └── index.js              # Express app entry
│   ├── uploads/                  # Uploaded CVs
│   ├── .env.example
│   └── package.json
```

---

## Database Schema

The PostgreSQL schema includes 6 tables:

- **users** — Account data
- **resumes** — CV files, parsed text, AI feedback
- **github_profiles** — GitHub profile & repos cache
- **projects** — Projects (from GitHub or manual)
- **portfolios** — Generated portfolio data
- **skill_assessments** — Skill gap & interview questions

---

## Author

-Oussama
