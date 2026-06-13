import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import '../styles.css';

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

const config = window.OX_GAME_CONFIG ?? {};
const rootId = config.rootId ?? 'ox-game-root';
const rootElement = document.getElementById(rootId);
const googleClientId = config.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const initialPath = config.initialPath ?? '/game';

if (!rootElement) {
  console.warn(`[OX Game] Root element #${rootId} not found.`);
} else if (!googleClientId) {
  rootElement.innerHTML = '<p>OX Game configuration error: missing Google Client ID.</p>';
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}
