# ResumeAI — AI-Powered Resume Analyser

> Live at **[https://ai-cv-analyser-seven.vercel.app](https://ai-cv-analyser-seven.vercel.app)**

An AI-powered web application that analyses resumes against job descriptions and provides a detailed score, ATS compatibility check, keyword gap analysis, and rewrite suggestions,powered by GPT-4o.

---

## Features

- AI scoring across tone, content, structure, and skills
- ATS compatibility check
- Keyword gap analysis
- Rewrite suggestions
- PDF export
- Shareable results link
- Google OAuth + email/password sign in
- Job description library
- Analysis history

---

## Tech Stack

**Client** — React 18, TypeScript, Vite, Tailwind CSS, Zustand

**Server** — Node.js, Express, TypeScript, Prisma, PostgreSQL, Bull, Redis, OpenAI GPT-4o, Passport.js

**Infrastructure** — Vercel (client) · Render (server + DB) · Upstash (Redis)

---

## Production Infrastructure

| Service | Provider | URL |
|---|---|---|
| Client | Vercel | https://ai-cv-analyser-seven.vercel.app |
| Server | Render | https://resume-analyser-server-pb2q.onrender.com |
| Database | Render PostgreSQL | Internal |
| Redis | Upstash | TCP with TLS |

---

## Environment Variables (Render)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Render internal PostgreSQL URL |
| `JWT_ACCESS_SECRET` | Min 32 chars random string |
| `JWT_REFRESH_SECRET` | Min 32 chars random string |
| `REDIS_HOST` | Upstash hostname |
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | Upstash password |
| `REDIS_TLS` | `true` |
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `https://resume-analyser-server-pb2q.onrender.com/api/auth/google/callback` |
| `CLIENT_URL` | `https://ai-cv-analyser-seven.vercel.app` |
| `NODE_ENV` | `production` |


---

## License

MIT
