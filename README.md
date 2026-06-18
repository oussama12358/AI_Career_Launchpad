# AI Career Launchpad

Full-stack AI Career Launchpad project with a Next.js frontend and an Express backend.

## What it does

- User registration and login with JWT authentication
- Resume PDF upload, parsing, and AI-based feedback
- GitHub profile integration for importing projects and skills
- AI-powered portfolio generation and customization
- Skills dashboard with endorsements and interview prep
- Project showcase management and analytics tracking

## Tech Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- AI: Grok AI service integration
- Auth: JWT
- File uploads: Multer
- PDF tools: pdf-parse, pdfkit

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Grok API key (for AI features)

## Backend Setup

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create the environment file and update values:

```bash
copy .env.example .env
```

Fill in:

- `DATABASE_URL` with your PostgreSQL connection string
- `JWT_SECRET` with a secret phrase
- `GROK_API_KEY` with your Grok key
- `FRONTEND_URL` if using a different frontend host

4. Run the backend in development mode:

```bash
npm run dev
```

The backend listens on `http://localhost:5000` by default.

## Frontend Setup

1. Open a second terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Optionally create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Running Locally

Run both servers in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Then open `http://localhost:3000`.

## Environment Variables

Backend `.env` settings:

- `PORT` (default `5000`)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GROK_API_KEY`
- `GITHUB_TOKEN` (optional, for higher GitHub API rate limits)
- `FRONTEND_URL`

Frontend `.env.local` settings:

- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Resume

- `POST /api/resume/upload` — Upload resume PDF and analyze
- `GET /api/resume` — Retrieve resume data and feedback
- `GET /api/resume/download/:format` — Download generated resume PDF

### GitHub

- `POST /api/github/connect` — Connect GitHub username
- `GET /api/github` — Get GitHub profile data

### Portfolio

- `POST /api/portfolio/generate` — Generate AI portfolio
- `GET /api/portfolio` — Get portfolio
- `PUT /api/portfolio` — Update portfolio
- `GET /api/portfolio/public/:slug` — Public portfolio view

### Projects

- `GET /api/projects` — List projects
- `POST /api/projects` — Create project with AI description
- `DELETE /api/projects/:id` — Remove project
- `POST /api/projects/:id/regenerate` — Regenerate AI project description

### Customization & Skills

- `GET /api/customization/themes` — Get available themes
- `GET /api/customization/:portfolioId` — Get portfolio customization
- `PUT /api/customization/:portfolioId` — Update customization
- `GET /api/skills` — Get user skills
- `POST /api/skills` — Add new skill
- `PUT /api/skills/:skillId` — Update skill proficiency
- `DELETE /api/skills/:skillId` — Delete skill
- `POST /api/skills/:skillId/endorse` — Endorse skill
- `DELETE /api/skills/:skillId/endorse` — Remove endorsement

### Analytics & Sharing

- `GET /api/analytics/:portfolioId` — Get analytics
- `POST /api/analytics/:portfolioId/track` — Track portfolio view
- `POST /api/analytics/:portfolioId/share` — Create share link
- `GET /api/analytics/:portfolioId/shares` — List share links
- `DELETE /api/analytics/share/:shareId` — Delete share link

## Database Schema

The project stores:

- `users`
- `resumes`
- `github_profiles`
- `projects`
- `portfolios`
- `skills`

Schema SQL is located in `backend/src/config/schema.sql`.

## Project Structure

```
ai-career-launchpad/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── lib/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Notes

- The frontend uses `NEXT_PUBLIC_API_URL` to call the backend API.
- Resume upload only accepts PDF files.
- GitHub integration supports public profiles by default.

## Author

- Oussama

