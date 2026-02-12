
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Logger } from '../utils/logger';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { deviceName, deviceType } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'UNKNOWN';
    
    const result = await authService.registerDevice(deviceName, deviceType, clientIp);
    res.status(201).json(result);
  } catch (error) {
    Logger.error('Registration failed', error);
    res.status(500).json({ error: 'Registration failed due to server error.' });
  }
};
