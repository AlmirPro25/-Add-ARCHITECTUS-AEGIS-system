
import { Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { Logger } from '../utils/logger';

const deviceService = new DeviceService();

export const listDevices = async (req: Request, res: Response) => {
  try {
    const devices = await deviceService.getAllDevices();
    res.json(devices);
  } catch (error) {
    Logger.error('Failed to fetch devices', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const device = await deviceService.getDeviceById(id);
        if (!device) {
          return res.status(404).json({ error: 'Device not found' });
        }
        const logs = await deviceService.getDeviceLogs(id);
        res.json(logs);
    } catch (error) {
        Logger.error(`Failed to fetch logs for device ${req.params.id}`, error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
}
