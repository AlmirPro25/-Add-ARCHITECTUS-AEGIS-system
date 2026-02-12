
import { Response } from 'express';
import { OsintService } from '../services/osint.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { OsintSearchSchema } from '../models/schemas';
import { Logger } from '../utils/logger';
import { z } from 'zod';

const osintService = new OsintService();

export const search = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      Logger.warn('Unauthorized OSINT search attempt without user context.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Query validation handled by validateQuery middleware, but good to ensure type safety
    const { query } = OsintSearchSchema.parse(req.query);

    Logger.info(`OSINT search initiated by ${req.user.deviceId} for query: "${query}"`);
    const results = await osintService.performSearch(query);
    
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      Logger.warn('OSINT search validation error', error.errors);
      return res.status(400).json({ error: 'Invalid query parameter', details: error.errors });
    }
    Logger.error('OSINT search failed due to server error.', error);
    res.status(500).json({ error: 'OSINT search failed due to server error.' });
  }
};
