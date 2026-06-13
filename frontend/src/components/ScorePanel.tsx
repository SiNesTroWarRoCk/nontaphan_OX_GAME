import type { Me } from '../types/api';

export function ScorePanel({ user }: { user: Me | null }) {
  return (
    <section className="card score-panel">
      <h2>Score</h2>
      <p><strong>Current score:</strong> {user?.score ?? 0}</p>
      <p><strong>Consecutive wins:</strong> {user?.consecutiveWins ?? 0}</p>
      <p><strong>Games:</strong> {user?.totalGames ?? 0}</p>
      <p><strong>W/L/D:</strong> {user ? `${user.totalWins}/${user.totalLosses}/${user.totalDraws}` : '0/0/0'}</p>
    </section>
  );
}
