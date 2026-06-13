import { Navigate } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <main className="page"><LoadingState /></main>;
  if (isAuthenticated) return <Navigate to="/game" replace />;

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>OX Game</h1>
        <p>Login with Google to play Tic-tac-toe against a smart bot and compete on the scoreboard.</p>
        <LoginButton />
      </section>
    </main>
  );
}
