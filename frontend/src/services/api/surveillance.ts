
import { apiClient } from '../../lib/axios';
import { DeviceSchema, MissionLogSchema, ApiResponse } from '../../../shared/types';
import { z } from 'zod';
import { Device, MissionLog } from '../../types'; // Using re-exported types

export const SurveillanceAPI = {
  /**
   * Recupera a lista de todos os ativos monitorados.
   */
  getDevices: async (): Promise<Device[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Device[]>>('/devices/list');
      // Validate the array of devices
      return z.array(DeviceSchema).parse(response.data);
    } catch (error) {
      console.error('[SurveillanceAPI] Failed to fetch devices:', error);
      throw error;
    }
  },

  /**
   * Recupera logs de missão para um dispositivo específico.
   */
  getLogs: async (deviceId: string, limit = 100): Promise<MissionLog[]> => {
    try {
      const response = await apiClient.get<ApiResponse<MissionLog[]>>(`/devices/${deviceId}/logs`, {
        params: { limit }
      });
      // Validate the array of mission logs
      return z.array(MissionLogSchema).parse(response.data);
    } catch (error) {
      console.error(`[SurveillanceAPI] Failed to fetch logs for device ${deviceId}:`, error);
      throw error;
    }
  },

  /**
   * (Opcional) Envia comando remoto para um dispositivo (via Socket.io ou HTTP).
   * Note: This is an example, actual implementation might use Socket.io for real-time commands.
   */
  sendCommand: async (deviceId: string, command: string, params: any = {}) => {
    try {
      // In this system, direct commands are typically sent via WebSocket for real-time control.
      // This HTTP endpoint could be a fallback or for less critical/asynchronous commands.
      const response = await apiClient.post<ApiResponse<void>>(`/devices/${deviceId}/command`, { command, params });
      if (response.data.message) {
        console.log(`[SurveillanceAPI] Command sent to ${deviceId}: ${response.data.message}`);
      }
      return response.data;
    } catch (error) {
      console.error(`[SurveillanceAPI] Failed to send command to device ${deviceId}:`, error);
      throw error;
    }
  }
};
