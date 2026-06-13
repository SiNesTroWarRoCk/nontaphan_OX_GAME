import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { apiFetch } from '../services/api';

export function useApi() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  const request = useCallback(
    async function request<T>(path: string, init?: RequestInit): Promise<T> {
      try {
        const token = await getAccessTokenSilently();
        return await apiFetch<T>(path, token, init);
      } catch (error) {
        if (error instanceof Error && error.message.toLowerCase().includes('login')) {
          await loginWithRedirect();
        }
        throw error;
      }
    },
    [getAccessTokenSilently, loginWithRedirect],
  );

  return { request };
}
