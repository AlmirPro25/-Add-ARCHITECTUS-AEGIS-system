
import { z } from 'zod';

/**
 * Shared Zod Schemas and TypeScript Types
 * This file centralizes data contracts used by both backend and frontend.
 */

// --- Authentication ---
export const RegisterDeviceSchema = z.object({
  deviceName: z.string().min(2).max(50),
  deviceType: z.enum(['ANDROID', 'IOS', 'WEB_AGENT', 'GENERIC', 'MISSION_CONTROL']).default('GENERIC'), // Added MISSION_CONTROL
});

export const DeviceBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['ANDROID', 'IOS', 'WEB_AGENT', 'GENERIC', 'MISSION_CONTROL']),
  isOnline: z.boolean(),
  lastBattery: z.number().int().min(0).max(100),
  lastLat: z.number().nullable(),
  lastLng: z.number().nullable(),
  lastIp: z.string().nullable(),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  deviceId: z.string().uuid(),
  device: DeviceBaseSchema, // Returns full device object
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// --- Telemetry ---
export const TelemetryDataSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  acc: z.number().optional(), // Accuracy for GPS
  level: z.number().int().min(0).max(100).optional(), // Battery level
  cpu: z.number().min(0).max(100).optional(), // CPU usage
  mem: z.number().min(0).max(100).optional(), // Memory usage
  online: z.boolean().optional(), // Device online status
  message: z.string().optional(), // Generic message for status/network
  // For sensor types
  alpha: z.number().optional(), // Device orientation (Z)
  beta: z.number().optional(),  // Device orientation (X)
  gamma: z.number().optional(), // Device orientation (Y)
  x: z.number().optional(),     // Accelerometer/Gyroscope X-axis
  y: z.number().optional(),     // Accelerometer/Gyroscope Y-axis
  z: z.number().optional(),     // Accelerometer/Gyroscope Z-axis
}).catchall(z.any()); // Allow any other dynamic sensor data

export const TelemetrySchema = z.object({
  type: z.enum(['GPS', 'SENSOR', 'NETWORK', 'BATTERY', 'STATUS', 'ACCELEROMETER', 'GYROSCOPE']), // Added ACCELEROMETER, GYROSCOPE
  data: TelemetryDataSchema, // JSON payload
});
export type Telemetry = z.infer<typeof TelemetrySchema>;

export const SnapshotMetaSchema = z.object({
  timestamp: z.string().datetime(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(['IMAGE', 'AUDIO', 'VIDEO', 'SCREENSHOT']),
  description: z.string().optional(),
});
export type SnapshotMeta = z.infer<typeof SnapshotMetaSchema>;


// --- Device Management ---
export const DeviceSchema = DeviceBaseSchema; // Reusing the base schema
export type Device = z.infer<typeof DeviceSchema>;

export const MissionLogSchema = z.object({
  id: z.string().uuid(),
  deviceId: z.string().uuid(),
  timestamp: z.string().datetime(),
  level: z.enum(['INFO', 'WARN', 'CRITICAL']),
  message: z.string(),
});
export type MissionLog = z.infer<typeof MissionLogSchema>;

// --- OSINT ---
export const OsintSearchSchema = z.object({
  query: z.string().min(3).max(100),
});

export const OsintSearchResultSchema = z.object({
  source: z.string(),
  type: z.string(),
  data: z.record(z.any()), // Flexible object for search-specific data
});
export type OsintSearchResult = z.infer<typeof OsintSearchResultSchema>;

// --- General API Response Structure ---
// Generic API response wrapper, useful for consistent error handling
export const ApiResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  statusCode: z.number().optional(),
});
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & { data: T };
