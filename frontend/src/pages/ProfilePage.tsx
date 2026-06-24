import { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ErrorState';
import { Layout } from '../components/Layout';
import { LoadingState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import type { Me } from '../types/api';

export function ProfilePage() {
  const { request } = useApi();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<Me>('/api/me')
      .then(setMe)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [request]);

  return (
    <Layout>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {me && (
        <section className="card profile">
          <Avatar src={me.avatarUrl} name={me.displayName} email={me.email} />
          <h2 className="profile-title">{me.displayName ?? me.email ?? 'Player'}</h2>
          <p className="profile-email">{me.email}</p>
          <p className="profile-stat"><strong>Score:</strong> {me.score}</p>
          <p className="profile-stat"><strong>Consecutive wins:</strong> {me.consecutiveWins}</p>
          <p className="profile-stat"><strong>Total games:</strong> {me.totalGames}</p>
          <p className="profile-stat"><strong>Wins/Losses/Draws:</strong> {me.totalWins}/{me.totalLosses}/{me.totalDraws}</p>
        </section>
      )}
    </Layout>
  );
}
