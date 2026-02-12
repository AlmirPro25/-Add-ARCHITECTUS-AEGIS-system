
import { z } from 'zod';

export const RegisterDeviceSchema = z.object({
  deviceName: z.string().min(2, "Device name must be at least 2 characters").max(50, "Device name cannot exceed 50 characters"),
  deviceType: z.enum(['ANDROID', 'IOS', 'WEB_AGENT', 'GENERIC', 'MISSION_CONTROL']).default('GENERIC'),
});

export const TelemetryDataSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  acc: z.number().optional(), // Accuracy for GPS
  level: z.number().int().min(0).max(100).optional(), // Battery level
  cpu: z.number().min(0).max(100).optional(), // CPU usage
  mem: z.number().min(0).max(100).optional(), // Memory usage
  online: z.boolean().optional(), // Device online status
  message: z.string().optional(), // Generic message for status/network
}).catchall(z.any()); // Allow any other fields to be sent

export const TelemetrySchema = z.object({
  type: z.enum(['GPS', 'SENSOR', 'NETWORK', 'BATTERY', 'STATUS', 'ACCELEROMETER', 'GYROSCOPE']), // Added ACCELEROMETER, GYROSCOPE
  data: TelemetryDataSchema, // JSON payload
});

export const SnapshotMetaSchema = z.object({
  timestamp: z.string().datetime(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(['IMAGE', 'AUDIO', 'VIDEO', 'SCREENSHOT']),
  description: z.string().optional(),
});

export const OsintSearchSchema = z.object({
  query: z.string().min(3, "Search query must be at least 3 characters").max(100, "Search query cannot exceed 100 characters"),
});
