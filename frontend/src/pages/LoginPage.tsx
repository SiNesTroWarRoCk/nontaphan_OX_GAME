import { Navigate } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../auth/AuthContext';
import logoUrl from '../assets/images/logo.png';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <main className="page"><LoadingState /></main>;
  if (isAuthenticated) return <Navigate to="/game" replace />;

  return (
    <main className="login-page">
      <section className="login-card">
        <img className="login-logo" src={logoUrl} alt="OX Game logo" />
        <h1 className="login-title">OX Game</h1>
        <p className="login-description">Login with Google to play Tic-tac-toe against a smart bot and compete on the scoreboard.</p>
        <div className="login-actions">
          <LoginButton />
        </div>
      </section>
    </main>
  );
}
