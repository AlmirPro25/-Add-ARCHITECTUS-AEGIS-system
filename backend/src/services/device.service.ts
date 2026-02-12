
import prisma from '../prisma';
import { Logger } from '../utils/logger';
import { Device } from '@prisma/client';

export class DeviceService {
  async getAllDevices(): Promise<Omit<Device, 'token'>[]> {
    return prisma.device.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        isOnline: true,
        lastBattery: true,
        lastLat: true,
        lastLng: true,
        lastIp: true,
        updatedAt: true,
        createdAt: true
      }
    });
  }

  async updateStatus(deviceId: string, isOnline: boolean) {
    try {
      const device = await prisma.device.update({
        where: { id: deviceId },
        data: { isOnline, updatedAt: new Date() }
      });
      Logger.info(`Device ${device.name} status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      return device;
    } catch (error) {
      Logger.error(`Failed to update status for device ${deviceId}`, error);
      throw new Error(`Device not found or update failed for ID: ${deviceId}`);
    }
  }
  
  async getDeviceLogs(deviceId: string): Promise<any[]> {
    return prisma.missionLog.findMany({
        where: { deviceId },
        orderBy: { timestamp: 'desc' },
        take: 50
    });
  }

  async getDeviceById(deviceId: string): Promise<Omit<Device, 'token'> | null> {
    return prisma.device.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        name: true,
        type: true,
        isOnline: true,
        lastBattery: true,
        lastLat: true,
        lastLng: true,
        lastIp: true,
        updatedAt: true,
        createdAt: true
      }
    });
  }
}
