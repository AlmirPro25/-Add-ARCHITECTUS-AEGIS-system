
import { Response } from 'express';
import { TelemetryService } from '../services/telemetry.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { SnapshotMetaSchema } from '../models/schemas';
import { Logger } from '../utils/logger';
import path from 'path';

const telemetryService = new TelemetryService();

export const uploadSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      Logger.warn('Unauthorized attempt to upload snapshot without user context.');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.file) {
      Logger.warn('Snapshot upload attempt failed: No file uploaded.', { deviceId: req.user.deviceId });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let meta: any = {};
    if (req.body.meta) {
      try {
        meta = JSON.parse(req.body.meta);
        SnapshotMetaSchema.parse(meta); // Validate meta payload
      } catch (parseError) {
        Logger.warn('Invalid meta JSON for snapshot upload.', { deviceId: req.user.deviceId, error: parseError });
        return res.status(400).json({ error: 'Invalid or malformed meta data in snapshot upload.' });
      }
    } else {
        // Provide minimal default meta if not sent, assuming a generic image type
        meta = {
            timestamp: new Date().toISOString(),
            type: 'IMAGE',
            description: 'Generic snapshot'
        };
    }
    
    // Store file path in database
    const filePath = path.join('/uploads', req.file.filename); // Publicly accessible path
    await telemetryService.saveMediaAsset(req.user.deviceId, filePath, meta);
    
    await telemetryService.logMissionEvent(
        req.user.deviceId, 
        'INFO', 
        `Snapshot (${meta.type}) uploaded: ${req.file.filename}`
    );
    
    res.json({ status: 'uploaded', path: filePath, type: meta.type });
  } catch (error) {
    Logger.error('Snapshot upload failed.', error);
    res.status(500).json({ error: 'Upload failed due to server error.' });
  }
};
