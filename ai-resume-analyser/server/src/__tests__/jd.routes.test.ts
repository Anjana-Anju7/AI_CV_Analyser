import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';

// Prevent Redis connection during tests
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

const USER_EMAIL = `jd-test-${Date.now()}@example.com`;
const PASSWORD = 'Password123!';
let accessToken: string;
let createdJdId: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: USER_EMAIL, password: PASSWORD, name: 'JD Tester' });
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.savedJD.deleteMany({ where: { user: { email: USER_EMAIL } } });
  await prisma.user.deleteMany({ where: { email: USER_EMAIL } });
  await prisma.$disconnect();
});

describe('GET /api/jds', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/jds');
    expect(res.status).toBe(401);
  });

  it('returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });
});

describe('POST /api/jds', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/jds')
      .send({ title: 'Engineer', description: 'Build things' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Build things' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Engineer' });
    expect(res.status).toBe(400);
  });

  it('creates a JD and returns 201', async () => {
    const res = await request(app)
      .post('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Senior Software Engineer',
        company: 'Acme Corp',
        description: 'We are looking for a senior engineer to build scalable systems.',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Senior Software Engineer');
    expect(res.body.company).toBe('Acme Corp');
    createdJdId = res.body.id;
  });

  it('saved JD appears in list', async () => {
    const res = await request(app)
      .get('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(createdJdId);
  });
});

describe('DELETE /api/jds/:id', () => {
  it('returns 204 and removes the JD', async () => {
    const res = await request(app)
      .delete(`/api/jds/${createdJdId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);

    const listRes = await request(app)
      .get('/api/jds')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(listRes.body).toHaveLength(0);
  });

  it('is idempotent — second delete also returns 204', async () => {
    const res = await request(app)
      .delete(`/api/jds/${createdJdId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });
});
