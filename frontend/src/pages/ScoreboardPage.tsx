import { useEffect, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { Layout } from '../components/Layout';
import { LoadingState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import type { ScoreboardRow } from '../types/api';

export function ScoreboardPage() {
  const { request } = useApi();
  const [rows, setRows] = useState<ScoreboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<ScoreboardRow[]>('/api/scoreboard')
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load scoreboard'))
      .finally(() => setLoading(false));
  }, [request]);

  return (
    <Layout>
      <section className="card">
        <h2>Scoreboard</h2>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Games</th>
                  <th>W</th>
                  <th>L</th>
                  <th>D</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.rank}-${row.email ?? row.displayName}`}>
                    <td>{row.rank}</td>
                    <td>{row.displayName ?? 'Player'}</td>
                    <td>{row.email ?? '-'}</td>
                    <td>{row.score}</td>
                    <td>{row.totalGames}</td>
                    <td>{row.totalWins}</td>
                    <td>{row.totalLosses}</td>
                    <td>{row.totalDraws}</td>
                    <td>{row.consecutiveWins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
