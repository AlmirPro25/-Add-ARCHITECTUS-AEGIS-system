
import jwt from 'jsonwebtoken';
import { Logger } from './logger';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = '24h';

if (!SECRET || SECRET === 'YOUR_SUPER_SECRET_TACTICAL_KEY_CHANGEME_IMMEDIATELY') {
  Logger.error('JWT_SECRET is not defined or is default value. Using a fallback. THIS IS NOT SECURE FOR PRODUCTION.');
  // In a real production system, this would cause the app to crash on startup if missing.
}
const ACTUAL_SECRET = SECRET && SECRET !== 'YOUR_SUPER_SECRET_TACTICAL_KEY_CHANGEME_IMMEDIATELY' ? SECRET : 'TACTICAL_SECRET_KEY_CHANGE_IMMEDIATELY_AND_RESTART_SERVER';


export interface TokenPayload {
  deviceId: string;
  type: string; // e.g., 'WEB_AGENT', 'MISSION_CONTROL'
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACTUAL_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ACTUAL_SECRET) as TokenPayload;
  } catch (error) {
    Logger.warn('Token verification failed', (error as Error).message);
    return null;
  }
};
