
import prisma from '../prisma';
import { generateToken } from '../utils/jwt';
import { Logger } from '../utils/logger';
import { Device } from '@prisma/client';

export class AuthService {
  async registerDevice(name: string, type: string, ipAddress: string): Promise<{ deviceId: string; token: string; device: Omit<Device, 'token'> }> {
    Logger.tactical(`Attempting to register new device: ${name} [${type}] from IP: ${ipAddress}`);

    // Check if a device with this name already exists (unique name constraint in schema)
    let device = await prisma.device.findUnique({
      where: { name }
    });

    if (device) {
      // If device exists, update its last IP, mark online, and generate a new token
      Logger.info(`Device "${name}" already exists. Re-issuing token.`);
      const token = generateToken({ deviceId: device.id, type: device.type });
      const updatedDevice = await prisma.device.update({
        where: { id: device.id },
        data: { token, isOnline: true, lastIp: ipAddress, updatedAt: new Date() },
        select: { id: true, name: true, type: true, isOnline: true, lastBattery: true, lastLat: true, lastLng: true, lastIp: true, updatedAt: true, createdAt: true }
      });
      await prisma.missionLog.create({
        data: {
          deviceId: device.id,
          level: 'INFO',
          message: 'Existing device re-authenticated with new token.'
        }
      });
      return { deviceId: updatedDevice.id, token, device: updatedDevice };
    }

    // Create a new device entry
    const newDevice = await prisma.device.create({
      data: {
        name,
        type,
        token: '', // Placeholder, will update shortly
        isOnline: true,
        lastIp: ipAddress
      }
    });

    // Generate Auth Token
    const token = generateToken({ deviceId: newDevice.id, type: newDevice.type });

    // Update device with its dedicated token for persistence check and return full object
    const finalDevice = await prisma.device.update({
      where: { id: newDevice.id },
      data: { token },
      select: { id: true, name: true, type: true, isOnline: true, lastBattery: true, lastLat: true, lastLng: true, lastIp: true, updatedAt: true, createdAt: true }
    });

    await prisma.missionLog.create({
      data: {
        deviceId: newDevice.id,
        level: 'INFO',
        message: 'New device registered and authorized.'
      }
    });

    Logger.tactical(`Device registered successfully: ${name} (${newDevice.id})`);
    return { deviceId: finalDevice.id, token, device: finalDevice };
  }
}
