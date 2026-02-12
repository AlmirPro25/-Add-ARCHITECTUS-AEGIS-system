
import prisma from '../prisma';
import { Logger } from '../utils/logger';
import { TelemetryDataSchema, SnapshotMetaSchema } from '../models/schemas';
import { z } from 'zod';

type TelemetryPayload = z.infer<typeof TelemetryDataSchema>;
type SnapshotMeta = z.infer<typeof SnapshotMetaSchema>;

export class TelemetryService {
  async processTelemetry(deviceId: string, type: string, data: TelemetryPayload) {
    // 1. Log the raw telemetry
    await prisma.telemetry.create({
      data: {
        deviceId,
        type,
        data: data as any // Prisma's Json type handles this
      }
    });

    // 2. Update Device State based on telemetry type
    // Atomic updates for critical stats
    const updateData: any = { updatedAt: new Date() };

    switch (type) {
      case 'GPS':
        if (data.lat !== undefined && data.lng !== undefined) {
          updateData.lastLat = parseFloat(data.lat.toString());
          updateData.lastLng = parseFloat(data.lng.toString());
        }
        break;
      case 'BATTERY':
        if (data.level !== undefined) {
          updateData.lastBattery = parseInt(data.level.toString());
        }
        break;
      case 'STATUS':
        if (data.online !== undefined) {
          updateData.isOnline = data.online;
        }
        break;
      // ACCELEROMETER/GYROSCOPE typically don't update device state directly
    }

    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      try {
        await prisma.device.update({
          where: { id: deviceId },
          data: updateData
        });
      } catch (error) {
        Logger.error(`Failed to update device state for ${deviceId} with type ${type}`, error);
      }
    }

    // Logger.info(`Telemetry processed for ${deviceId}`, { type, data }); // Commented for less verbose logs during high telemetry
  }

  async logMissionEvent(deviceId: string, level: string, message: string) {
      await prisma.missionLog.create({
          data: {
              deviceId,
              level,
              message
          }
      });
  }

  async saveMediaAsset(deviceId: string, filePath: string, meta: SnapshotMeta) {
    try {
      await prisma.mediaAsset.create({
        data: {
          deviceId,
          filepath: filePath,
          type: meta.type,
          metadata: meta as any, // Prisma Json type
          timestamp: new Date(meta.timestamp)
        }
      });
      Logger.info(`Media asset (${meta.type}) saved for device ${deviceId} at ${filePath}`);
    } catch (error) {
      Logger.error(`Failed to save media asset for device ${deviceId}`, error);
      throw new Error('Failed to save media asset.');
    }
  }
}
