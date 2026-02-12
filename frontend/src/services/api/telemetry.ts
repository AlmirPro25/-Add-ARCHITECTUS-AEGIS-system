
import { apiClient } from '../../lib/axios';
import { TelemetrySchema, ApiResponse, SnapshotMetaSchema } from '../../../shared/types';
import { z } from 'zod';

type SnapshotMeta = z.infer<typeof SnapshotMetaSchema>;

// TelemetryAPI no longer has a 'send' method for real-time sensor data.
// All real-time telemetry is now handled exclusively via WebSocket (`socketService.emitTelemetry`).
// This API client is now only responsible for file uploads.

export const TelemetryAPI = {
  /**
   * Envia um arquivo (imagem/áudio/vídeo/screenshot) como snapshot para o servidor.
   */
  uploadSnapshot: async (file: File, meta: SnapshotMeta) => {
    try {
      // Client-side validation for meta payload
      SnapshotMetaSchema.parse(meta);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('meta', JSON.stringify(meta)); // Metadata as JSON string

      const response = await apiClient.post<ApiResponse<{ status: string; path: string; type: string }>>(
        '/telemetry/snapshot', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data.data) {
        return response.data.data;
      } else {
        throw new Error("Invalid response data format for snapshot upload.");
      }
    } catch (error) {
      console.error('[TelemetryAPI] Failed to upload snapshot:', error);
      throw error;
    }
  }
};
