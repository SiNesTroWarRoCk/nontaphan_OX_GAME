import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../services/api';

export function useApi() {
  const { getToken, logout } = useAuth();

  const request = useCallback(
    async function request<T>(path: string, init?: RequestInit): Promise<T> {
      try {
        const token = await getToken();
        return await apiFetch<T>(path, token, init);
      } catch (error) {
        if (error instanceof Error && (error.message.includes('401') || error.message.toLowerCase().includes('login'))) {
          logout();
        }
        throw error;
      }
    },
    [getToken, logout],
  );

  return { request };
}
