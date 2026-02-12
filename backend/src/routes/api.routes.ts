
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as AuthController from '../controllers/auth.controller';
import * as DeviceController from '../controllers/device.controller';
import * as TelemetryController from '../controllers/telemetry.controller';
import * as OsintController from '../controllers/osint.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { RegisterDeviceSchema, OsintSearchSchema } from '../models/schemas';
import { Logger } from '../utils/logger';

const router = Router();

// Multer Setup for Snapshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for uploads
  fileFilter: (req, file, cb) => {
    // Accept images, audio, video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      Logger.warn(`File upload rejected: Invalid MIME type for file ${file.originalname}`, { mimetype: file.mimetype });
      cb(new Error('Only image, audio, and video files are allowed!'));
    }
  }
});

// Public Routes
router.post('/auth/register-device', validate(RegisterDeviceSchema), AuthController.register);

// Protected Routes
router.get('/devices/list', authenticate, DeviceController.listDevices);
router.get('/devices/:id/logs', authenticate, DeviceController.getLogs);

router.post('/telemetry/snapshot', 
  authenticate, 
  upload.single('file'), 
  TelemetryController.uploadSnapshot
);

// OSINT Route
router.get('/osint/search', authenticate, validateQuery(OsintSearchSchema), OsintController.search);

export default router;
