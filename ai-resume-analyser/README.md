# ResumeAI — AI-Powered Resume Analyser

An AI-powered full-stack web application that analyses resumes against job descriptions and provides a detailed score, ATS compatibility check, keyword gap analysis, and rewrite suggestions — all powered by GPT-4o.

---

## Features

- **AI Analysis** — GPT-4o scores your resume across tone & style, content, structure, and skills
- **ATS Check** — identifies formatting issues that would trip up Applicant Tracking Systems
- **Keyword Gap** — shows which keywords from the job description are present or missing
- **Rewrite Suggestions** — specific before/after suggestions for weak bullet points
- **PDF Export** — download the full analysis report as a PDF
- **Share Link** — generate a public link to share your results
- **Google OAuth** — sign in with Google or email + password
- **Job Description Library** — save and reuse job descriptions
- **Analysis History** — view all past analyses with scores

---

## Tech Stack

### Client
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state management)
- Axios + React Router v6

### Server
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Bull queue + Redis (async job processing & SSE pub/sub)
- Passport.js (Google OAuth 2.0)
- OpenAI GPT-4o (`response_format: json_object`)
- PDFKit (PDF generation)
- Cloudinary (file storage)
- JWT dual-token auth (access 15 min + refresh 7 days)

### Infrastructure
- **Client** → Vercel
- **Server** → Render (Docker)
- **Database** → Render PostgreSQL
- **Redis** → Upstash

---

## Project Structure

```
ai-resume-analyser/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── analysis/   # ScoreGauge, SectionAccordion, ATSCard, etc.
│   │   │   └── layout/     # Navbar, PageShell
│   │   ├── hooks/          # useAuth, useAnalysis, useSSE
│   │   ├── pages/          # Login, Register, Analyse, Results, History, etc.
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript interfaces
│   └── vercel.json
│
└── server/                 # Express + Node.js backend
    ├── prisma/
    │   └── schema.prisma   # Database schema
    ├── src/
    │   ├── lib/            # Prisma, Redis, OpenAI, Cloudinary, Passport clients
    │   ├── middleware/      # Auth, rate limiter, validation, error handler
    │   ├── routes/         # auth, analyses, jds
    │   ├── services/       # auth, analysis (GPT-4o), export (PDF), resume parser
    │   ├── workers/        # Bull queue processor
    │   └── types/
    ├── Dockerfile
    └── render.yaml
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- Redis running locally (or Upstash account)
- OpenAI API key
- Google Cloud OAuth credentials (optional for local)
- Cloudinary account (optional — files stored in memory without it)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyser.git
cd ai-resume-analyser
npm install
```

### 2. Set up the server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/resume_analyser
JWT_ACCESS_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-other-secret-min-32-chars
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CLIENT_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### 3. Set up the database

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the app

Open two terminals:

```bash
# Terminal 1 — server
npm run dev:server

# Terminal 2 — client
npm run dev:client
```

Client runs at `http://localhost:5173`, server at `http://localhost:3000`.

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | Yes | Redis port (usually 6379) |
| `REDIS_PASSWORD` | Prod | Redis password (required for Upstash) |
| `REDIS_TLS` | Prod | Set to `true` for Upstash |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Prod | Full callback URL (e.g. `https://your-server.onrender.com/api/auth/google/callback`) |
| `CLIENT_URL` | Yes | Frontend URL for CORS and redirects |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (files stored in memory without it) |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |

---

## Deployment

### Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorised redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-server.onrender.com/api/auth/google/callback`
4. Go to **OAuth consent screen** and set the **App name** to `ResumeAI`

### Upstash Redis

1. Create a database at [upstash.com](https://upstash.com)
2. Click **Connect → ioredis** tab to get the connection string
3. Extract `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` from the URL
4. Set `REDIS_TLS=true`

### Render (Server + Database)

1. Create a **PostgreSQL** database on Render — copy the **Internal Database URL** as `DATABASE_URL`
2. Create a **Web Service**, set root directory to `server`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start: `npm start`
3. Add all environment variables from the table above

### Vercel (Client)

1. Import the repo, set root directory to `client`
2. Framework: **Vite**, Build: `npm run build`, Output: `dist`
3. Update `client/vercel.json` destination URL to your Render server URL

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register with email + password |
| POST | `/api/auth/login` | — | Login with email + password |
| GET | `/api/auth/google` | — | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | — | Google OAuth callback |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/analyses` | JWT | Upload resume + queue analysis |
| GET | `/api/analyses` | JWT | Paginated analysis history |
| GET | `/api/analyses/:id` | JWT | Single analysis result |
| GET | `/api/analyses/:id/status` | JWT | SSE stream for live status |
| GET | `/api/analyses/:id/export` | JWT | Download PDF report |
| POST | `/api/analyses/:id/share` | JWT | Generate public share link |
| GET | `/api/shared/:token` | — | View shared analysis (public) |
| GET | `/api/jds` | JWT | List saved job descriptions |
| POST | `/api/jds` | JWT | Save a job description |
| DELETE | `/api/jds/:id` | JWT | Delete a job description |

---

## License

MIT
