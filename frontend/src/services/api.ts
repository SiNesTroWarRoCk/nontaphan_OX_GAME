declare global {
  interface Window {
    OX_GAME_CONFIG?: {
      googleClientId?: string;
      apiBaseUrl?: string;
      initialPath?: string;
      rootId?: string;
    };
  }
}

function getApiBaseUrl() {
  return window.OX_GAME_CONFIG?.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
}

export async function apiFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
