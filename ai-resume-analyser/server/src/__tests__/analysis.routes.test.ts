import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';

jest.mock('../lib/redis', () => ({
  redis: {
    publish: jest.fn().mockResolvedValue(1),
    duplicate: jest.fn().mockReturnValue({
      subscribe: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue(null),
    }),
    on: jest.fn(),
    quit: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock('../workers/analysis.worker', () => ({
  analysisQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job' }),
    process: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock('../lib/cloudinary', () => ({
  uploadResume: jest.fn().mockResolvedValue('https://example.com/resume.pdf'),
}));

jest.mock('../services/resumeParser.service', () => ({
  extractText: jest.fn().mockResolvedValue('Experienced software engineer with 5 years in TypeScript and Node.js.'),
  sanitiseText: jest.fn().mockImplementation((t: string) => t),
  validateMime: jest.fn(), // no-op — doesn't throw
}));

const USER_EMAIL = `analysis-test-${Date.now()}@example.com`;
const PASSWORD = 'Password123!';
const JD = 'We are looking for a senior engineer. React TypeScript Node.js experience required.';
let accessToken: string;
let analysisId: string;

const minimalPdf = Buffer.from('%PDF-1.0\n1 0 obj<</Type /Catalog>>endobj\n');

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: USER_EMAIL, password: PASSWORD, name: 'Analysis Tester' });
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.analysis.deleteMany({ where: { user: { email: USER_EMAIL } } });
  await prisma.user.deleteMany({ where: { email: USER_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/analyses', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/analyses')
      .attach('resume', minimalPdf, { filename: 'cv.pdf', contentType: 'application/pdf' })
      .field('jobDescription', JD);
    expect(res.status).toBe(401);
  });

  it('returns 400 when no file attached', async () => {
    const res = await request(app)
      .post('/api/analyses')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('jobDescription', JD);
    expect(res.status).toBe(400);
  });

  it('returns 400 when job description is too short', async () => {
    const res = await request(app)
      .post('/api/analyses')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', minimalPdf, { filename: 'cv.pdf', contentType: 'application/pdf' })
      .field('jobDescription', 'too short');
    expect(res.status).toBe(400);
  });

  it('queues analysis and returns 202 with id', async () => {
    const res = await request(app)
      .post('/api/analyses')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', minimalPdf, { filename: 'cv.pdf', contentType: 'application/pdf' })
      .field('jobDescription', JD);
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('QUEUED');
    analysisId = res.body.id;
  });
});

describe('GET /api/analyses', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/analyses');
    expect(res.status).toBe(401);
  });

  it('returns paginated response', async () => {
    const res = await request(app)
      .get('/api/analyses')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('analyses');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
    expect(Array.isArray(res.body.analyses)).toBe(true);
  });

  it('respects page and limit query params', async () => {
    const res = await request(app)
      .get('/api/analyses?page=1&limit=5')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });
});

describe('GET /api/analyses/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get(`/api/analyses/${analysisId}`);
    expect(res.status).toBe(401);
  });

  it('returns the analysis record', async () => {
    const res = await request(app)
      .get(`/api/analyses/${analysisId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(analysisId);
    expect(res.body.status).toBe('QUEUED');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .get('/api/analyses/non-existent-id-12345')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for another user\'s analysis', async () => {
    const otherEmail = `other-${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: otherEmail, password: PASSWORD });
    const otherToken = regRes.body.accessToken;

    const res = await request(app)
      .get(`/api/analyses/${analysisId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);

    await prisma.user.deleteMany({ where: { email: otherEmail } });
  });
});

describe('POST /api/analyses/:id/rewrite', () => {
  it('returns 400 when bullet is missing', async () => {
    const res = await request(app)
      .post(`/api/analyses/${analysisId}/rewrite`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/analyses/:id/share', () => {
  it('creates a share token and returns shareUrl', async () => {
    const res = await request(app)
      .post(`/api/analyses/${analysisId}/share`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('shareUrl');
    expect(res.body.shareUrl).toContain('/shared/');
  });
});

describe('GET /api/analyses/shared/:token', () => {
  it('returns 404 for invalid share token', async () => {
    const res = await request(app).get('/api/analyses/shared/invalid-token-xyz');
    expect(res.status).toBe(404);
  });

  it('returns analysis for valid share token', async () => {
    const shareRes = await request(app)
      .post(`/api/analyses/${analysisId}/share`)
      .set('Authorization', `Bearer ${accessToken}`);
    const token = shareRes.body.shareUrl.split('/shared/')[1];

    const res = await request(app).get(`/api/analyses/shared/${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdAt');
  });
});

describe('GET /api/analyses/:id/export', () => {
  it('returns 409 when analysis is not yet complete', async () => {
    const res = await request(app)
      .get(`/api/analyses/${analysisId}/export`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(409);
  });
});
