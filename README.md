# AI Career Launchpad
This repository contains the full-stack AI Career Launchpad project (backend API + Next.js frontend).

## Notes
- This repo includes both the backend API and the frontend Next.js app.
- Use this repo to run the Express API, database schema, frontend app, and AI / GitHub integrations.

## Features

- **User Authentication** — JWT-based register/login
- **CV Upload & Analysis** — PDF parsing + AI feedback & scoring via Grok
- **GitHub Integration** — Auto-import projects with AI-generated descriptions
- **Portfolio Generation** — AI-built portfolio
- **Skills Dashboard** — Detect skills from your CV and GitHub
- **Interview Prep** — AI-generated interview questions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| AI | Grok AI |
| Auth | JWT |

---

## Frontend

- Framework: Next.js 16 (React)
- Styling: Tailwind CSS
- Frontend communicates with backend via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`)


## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Grok API Key (obtain from your Grok provider)

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
#   GROK_API_KEY=your_grok_api_key_here

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file for Next.js (optional)
# Create a file named `.env.local` in the `frontend` folder and add:
#   NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start frontend dev server
npm run dev
# Frontend runs on http://localhost:3000
```

### Running Backend + Frontend Locally

Open two terminals and run the backend and frontend servers:

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

When both are running, the frontend will call the backend at `http://localhost:5000/api` by default. Adjust `NEXT_PUBLIC_API_URL` if your backend runs elsewhere.


## Getting a Grok API Key

1. Obtain a Grok API key from your Grok provider or account dashboard.
2. Copy the key and paste it into `backend/.env` as `GROK_API_KEY`

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

> **AI not configured:** Grok API key is not set or quota is unavailable. Portfolio generation will use basic defaults instead of AI-generated content. To enable richer results add `GROK_API_KEY` to the backend and restart the server.

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
│   │   │   ├── grokService.js  # Grok AI calls
│   │   │   └── githubService.js  # GitHub API calls
│   │   └── index.js              # Express app entry
│   ├── uploads/                  # Uploaded CVs
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   └── src/                    # Next.js app (pages/app)
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
