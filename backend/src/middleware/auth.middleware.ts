
import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { Logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Logger.warn('Authentication failed: Missing or malformed Authorization Header', { ip: req.ip });
    return res.status(401).json({ error: 'Missing or Malformed Authorization Header' });
  }

  const token = authHeader.split(' ')[1];
  
  const payload = verifyToken(token);

  if (!payload) {
    Logger.error('Invalid or Expired Token Attempt', { ip: req.ip });
    return res.status(403).json({ error: 'Invalid or Expired Token' });
  }

  req.user = payload;
  next();
};
