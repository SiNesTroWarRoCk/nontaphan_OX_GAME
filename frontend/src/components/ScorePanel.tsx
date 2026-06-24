import type { Me } from '../types/api';

export function ScorePanel({ user }: { user: Me | null }) {
  return (
    <section className="card score-panel">
      <h2 className="section-title">Score</h2>
      <p className="score-stat"><strong>Current score:</strong> {user?.score ?? 0}</p>
      <p className="score-stat"><strong>Consecutive wins:</strong> {user?.consecutiveWins ?? 0}</p>
      <p className="score-stat"><strong>Games:</strong> {user?.totalGames ?? 0}</p>
      <p className="score-stat"><strong>W/L/D:</strong> {user ? `${user.totalWins}/${user.totalLosses}/${user.totalDraws}` : '0/0/0'}</p>
    </section>
  );
}
