import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { GameBoard } from '../components/GameBoard';
import { GameResultModal } from '../components/GameResultModal';
import { Layout } from '../components/Layout';
import { LoadingState } from '../components/LoadingState';
import { ScorePanel } from '../components/ScorePanel';
import { useApi } from '../hooks/useApi';
import type { GameSessionResponse, Me, MoveResponse } from '../types/api';
import type { Board, GameStatus } from '../types/game';
import { createInitialBoard } from '../utils/gameLogic';

export function GamePage() {
  const { request } = useApi();
  const [user, setUser] = useState<Me | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [status, setStatus] = useState<GameStatus>('IN_PROGRESS');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  const applyGame = useCallback((game: GameSessionResponse) => {
    setGameId(game.id);
    setBoard(game.board);
    setStatus(game.status);
  }, []);

  const startGame = useCallback(async (forceNew = false) => {
    const game = await request<GameSessionResponse>('/api/games/start', {
      method: 'POST',
      body: JSON.stringify({ forceNew }),
    });
    applyGame(game);
    setResultMessage('');
    return game;
  }, [applyGame, request]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [me] = await Promise.all([
        request<Me>('/api/me'),
        startGame(false),
      ]);
      setUser(me);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [request, startGame]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCellClick(row: number, col: number) {
    if (!gameId || status !== 'IN_PROGRESS' || board[row][col] || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await request<MoveResponse>(`/api/games/${gameId}/move`, {
        method: 'POST',
        body: JSON.stringify({ row, col }),
      });
      applyGame(response);

      if (response.scoring) {
        const { scoring } = response;
        setResultMessage(scoring.message);
        setUser((current) => current && {
          ...current,
          score: scoring.currentScore,
          consecutiveWins: scoring.consecutiveWins,
          totalGames: current.totalGames + 1,
          totalWins: current.totalWins + (scoring.result === 'WIN' ? 1 : 0),
          totalLosses: current.totalLosses + (scoring.result === 'LOSE' ? 1 : 0),
          totalDraws: current.totalDraws + (scoring.result === 'DRAW' ? 1 : 0),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit move');
    } finally {
      setSubmitting(false);
    }
  }

  async function newGame() {
    setSubmitting(true);
    setError(null);
    try {
      await startGame(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new game');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Layout><LoadingState message="Loading game..." /></Layout>;

  return (
    <Layout>
      {error && <ErrorState message={error} />}
      <div className="game-grid">
        <ScorePanel user={user} />
        <section className="card game-card">
          <h2 className="section-title">Player X vs Bot O</h2>
          <GameBoard board={board} disabled={status !== 'IN_PROGRESS' || submitting} onCellClick={handleCellClick} />
          <button className="secondary game-action" onClick={newGame} disabled={submitting}>New Game</button>
        </section>
      </div>
      {status !== 'IN_PROGRESS' && status !== 'ABANDONED' && (
        <GameResultModal status={status} message={resultMessage || 'Game finished'} onNewGame={newGame} />
      )}
    </Layout>
  );
}
