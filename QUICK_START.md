# 🚀 AI Career Launchpad - Quick Start Guide

## 🔧 Run the App Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 3. Configure Frontend API URL
If the backend uses the default port, no action is needed.
If not, create `frontend/.env.local` and add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## ✅ Main App Sections

- **Dashboard / Customize** — Portfolio theme and style settings
- **Dashboard / Skills** — Manage and endorse skills
- **Dashboard / Analytics** — Track portfolio views and share links
- **Resume** — Upload resume and download generated PDF templates
- **Projects** — Manage projects and AI-generated descriptions
- **GitHub** — Connect GitHub account to import repos

## 📌 Important Notes

- Backend uses PostgreSQL and expects `backend/.env` to include `DATABASE_URL`, `JWT_SECRET`, and `GROK_API_KEY`.
- Resume upload accepts only PDF files.
- The frontend uses `NEXT_PUBLIC_API_URL` to reach the backend API.

## 📖 Key Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/resume/upload`
- `GET /api/resume`
- `GET /api/resume/download/:format`
- `POST /api/github/connect`
- `GET /api/github`
- `POST /api/portfolio/generate`
- `GET /api/portfolio`
- `PUT /api/portfolio`
- `GET /api/portfolio/public/:slug`
- `GET /api/projects`
- `POST /api/projects`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/regenerate`

## 🛠️ Troubleshooting

If dependencies fail to install:

```bash
npm cache clean --force
npm install
```

If the frontend cannot connect to the API:
- Confirm backend is running on `http://localhost:5000`
- Confirm `NEXT_PUBLIC_API_URL` is set correctly

## 📁 Where to Look

- Frontend source: `frontend/src/app/`
- Backend routes: `backend/src/routes/index.js`
- Backend controllers: `backend/src/controllers/`
- Backend services: `backend/src/services/`

---

**Quick start complete.**