import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user: { id: string };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Support token in Authorization header OR query param (needed for EventSource/SSE)
  const auth = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : queryToken;

  if (!token) {
    return res.status(401).json({ error: 'Missing token', code: 'UNAUTHORIZED' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string };
    (req as AuthRequest).user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
}
