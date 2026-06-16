import { jest, describe, it, expect, afterAll } from "@jest/globals";
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

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';
let savedRefreshToken: string;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });
  await prisma.$disconnect();
});

// health check
describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(TEST_EMAIL);
    savedRefreshToken = res.body.refreshToken;
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
  });

  it('rejects weak password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'other@example.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    savedRefreshToken = res.body.refreshToken;
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns a new access token for valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: savedRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    savedRefreshToken = res.body.refreshToken;
  });

  it('invalidates old refresh token after rotation', async () => {
    const newRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: savedRefreshToken });
    const rotatedToken = newRes.body.refreshToken;

    // old token should now fail
    const replayRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: savedRefreshToken });
    expect(replayRes.status).toBe(401);
    savedRefreshToken = rotatedToken;
  });

  it('returns 400 when refresh token is missing', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 for garbage token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'fake-token-abc' });
    expect(res.status).toBe(401);
  });
});
