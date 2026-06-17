import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { passport } from './lib/passport';
import authRoutes from './routes/auth.routes';
import analysisRoutes from './routes/analysis.routes';
import jdRoutes from './routes/jd.routes';

// Import worker to register Bull processor
import './workers/analysis.worker';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(passport.initialize());
app.use(apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/jds', jdRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  async function shutdown(signal: string) {
    console.log(`[${signal}] Shutting down gracefully…`);
    server.close(async () => {
      try {
        const { prisma } = await import('./lib/prisma');
        await prisma.$disconnect();
      } catch {}
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
