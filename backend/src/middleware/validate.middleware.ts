
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { Logger } from '../utils/logger';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      Logger.warn('Validation Error', { path: req.path, errors: error.errors });
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: error.errors 
      });
    }
    Logger.error('Internal Server Error during validation', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const validateQuery = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      Logger.warn('Validation Error in query parameters', { path: req.path, errors: error.errors });
      return res.status(400).json({ 
        error: 'Validation Error in query parameters', 
        details: error.errors 
      });
    }
    Logger.error('Internal Server Error during query validation', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
