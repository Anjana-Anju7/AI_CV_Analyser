import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { register, login, refresh, generateTokens } from '../auth.service';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const EMAIL = `auth-svc-${Date.now()}@example.com`;
const PASSWORD = 'Password123!';
let savedRefreshToken: string;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'auth-svc-' } } });
  await prisma.$disconnect();
});

describe('generateTokens', () => {
  it('returns a valid JWT access token', () => {
    const { accessToken } = generateTokens('user-123');
    const decoded = jwt.decode(accessToken) as any;
    expect(decoded.sub).toBe('user-123');
  });

  it('returns a random refresh token string of length 128', () => {
    const { refreshToken } = generateTokens('user-123');
    expect(refreshToken).toHaveLength(128);
  });

  it('generates unique refresh tokens each call', () => {
    const a = generateTokens('user-123');
    const b = generateTokens('user-123');
    expect(a.refreshToken).not.toBe(b.refreshToken);
  });
});

describe('register', () => {
  it('creates a user and returns tokens + user object', async () => {
    const result = await register(EMAIL, PASSWORD, 'Test User');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(EMAIL);
    expect(result.user.name).toBe('Test User');
    savedRefreshToken = result.refreshToken;
  });

  it('throws EMAIL_TAKEN for duplicate email', async () => {
    await expect(register(EMAIL, PASSWORD)).rejects.toThrow('EMAIL_TAKEN');
  });
});

describe('login', () => {
  it('returns tokens for valid credentials', async () => {
    const result = await login(EMAIL, PASSWORD);
    expect(result).toHaveProperty('accessToken');
    expect(result.user.email).toBe(EMAIL);
  });

  it('throws INVALID_CREDENTIALS for wrong password', async () => {
    await expect(login(EMAIL, 'wrongpassword')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('throws INVALID_CREDENTIALS for unknown email', async () => {
    await expect(login('nobody@example.com', PASSWORD)).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('rotates refresh token on each login', async () => {
    const first = await login(EMAIL, PASSWORD);
    const second = await login(EMAIL, PASSWORD);
    expect(first.refreshToken).not.toBe(second.refreshToken);
    savedRefreshToken = second.refreshToken;
  });
});

describe('refresh', () => {
  it('returns a new access token for a valid refresh token', async () => {
    const result = await refresh(savedRefreshToken);
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('rotates the refresh token (old token no longer valid)', async () => {
    const { refreshToken: newToken } = await refresh(savedRefreshToken);
    await expect(refresh(savedRefreshToken)).rejects.toThrow('INVALID_REFRESH_TOKEN');
    savedRefreshToken = newToken;
  });

  it('throws INVALID_REFRESH_TOKEN for garbage input', async () => {
    await expect(refresh('not-a-real-token')).rejects.toThrow('INVALID_REFRESH_TOKEN');
  });
});
