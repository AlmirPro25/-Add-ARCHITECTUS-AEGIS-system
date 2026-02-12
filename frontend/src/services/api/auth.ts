
import { apiClient } from '../../lib/axios';
import { AuthResponseSchema, RegisterDeviceSchema, ApiResponse } from '../../../shared/types';
import { z } from 'zod';
import { AuthResponse } from '../../types'; // Using re-exported types

type RegisterPayload = z.infer<typeof RegisterDeviceSchema>;

export const AuthAPI = {
  /**
   * Realiza o handshake inicial com o servidor C2.
   * Gera um token de sessão persistente e retorna detalhes do dispositivo.
   */
  registerDevice: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register-device', payload);
      // Validate response data with Zod for safety
      return AuthResponseSchema.parse(response.data);
    } catch (error) {
      console.error('[AuthAPI] Error registering device:', error);
      throw error;
    }
  },

  /**
   * Verifica se o token atual ainda é válido (requer backend endpoint).
   * Para esta demo, tentaremos buscar dados protegidos para validar o token.
   */
  verifySession: async (): Promise<boolean> => {
    const token = localStorage.getItem('tactical_token');
    if (!token) {
        console.warn('[AuthAPI] No token found for session verification.');
        return false;
    }

    try {
      // Try to fetch protected data (e.g., device list) to see if token is valid
      // This will be intercepted by axios to attach the token.
      await apiClient.get('/devices/list'); 
      return true;
    } catch (error) {
      console.warn('[AuthAPI] Session verification failed, likely invalid or expired token:', (error as Error).message);
      localStorage.removeItem('tactical_token');
      localStorage.removeItem('device_id');
      return false;
    }
  }
};
