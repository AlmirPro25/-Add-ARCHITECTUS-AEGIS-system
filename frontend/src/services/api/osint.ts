
import { apiClient } from '../../lib/axios';
import { OsintSearchSchema, OsintSearchResultSchema, ApiResponse } from '../../../shared/types';
import { z } from 'zod';
import { OsintSearchResult } from '../../types'; // Using re-exported types

export const OsintAPI = {
  /**
   * Realiza uma busca de inteligência de código aberto (OSINT).
   */
  search: async (query: string): Promise<OsintSearchResult[]> => {
    try {
      const queryPayload = OsintSearchSchema.parse({ query }); // Validate query client-side
      const response = await apiClient.get<ApiResponse<OsintSearchResult[]>>(`/osint/search`, {
        params: queryPayload
      });
      // Validate the array of OSINT search results
      return z.array(OsintSearchResultSchema).parse(response.data);
    } catch (error) {
      console.error('[OsintAPI] OSINT search failed:', error);
      throw error;
    }
  }
};
