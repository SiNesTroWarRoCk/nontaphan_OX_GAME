import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import widgetStyles from '../styles.css?inline';

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

function injectWidgetStyles() {
  const styleId = 'ox-game-widget-styles';

  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = widgetStyles;
  document.head.appendChild(style);
}

if (!rootElement) {
  console.warn(`[OX Game] Root element #${rootId} not found.`);
} else if (!googleClientId) {
  rootElement.innerHTML = '<p>OX Game configuration error: missing Google Client ID.</p>';
} else {
  rootElement.classList.add('ox-game-widget');
  injectWidgetStyles();

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
