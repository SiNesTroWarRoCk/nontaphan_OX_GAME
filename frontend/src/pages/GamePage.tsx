import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { GameBoard } from '../components/GameBoard';
import { GameResultModal } from '../components/GameResultModal';
import { Layout } from '../components/Layout';
import { LoadingState } from '../components/LoadingState';
import { ScorePanel } from '../components/ScorePanel';
import { useApi } from '../hooks/useApi';
import type { GameResultResponse, Me } from '../types/api';
import type { Board, GameStatus } from '../types/game';
import { getBotMove } from '../utils/botLogic';
import { checkWinner, cloneBoard, createInitialBoard, statusToBackendResult, winnerToStatus } from '../utils/gameLogic';

export function GamePage() {
  const { request } = useApi();
  const [user, setUser] = useState<Me | null>(null);
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [status, setStatus] = useState<GameStatus>('IN_PROGRESS');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await request<Me>('/api/me'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const submitResult = useCallback(async (nextStatus: GameStatus, finalBoard: Board) => {
    const result = statusToBackendResult(nextStatus);
    if (!result || resultSubmitted) return;

    setSubmitting(true);
    setResultSubmitted(true);
    try {
      const response = await request<GameResultResponse>('/api/games/result', {
        method: 'POST',
        body: JSON.stringify({ result, boardSnapshot: finalBoard }),
      });
      setResultMessage(response.message);
      setUser((current) => current && {
        ...current,
        score: response.currentScore,
        consecutiveWins: response.consecutiveWins,
        totalGames: current.totalGames + 1,
        totalWins: current.totalWins + (result === 'WIN' ? 1 : 0),
        totalLosses: current.totalLosses + (result === 'LOSE' ? 1 : 0),
        totalDraws: current.totalDraws + (result === 'DRAW' ? 1 : 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  }, [request, resultSubmitted]);

  function finishIfNeeded(nextBoard: Board): GameStatus {
    const nextStatus = winnerToStatus(checkWinner(nextBoard));
    if (nextStatus !== 'IN_PROGRESS') {
      setStatus(nextStatus);
      void submitResult(nextStatus, nextBoard);
    }
    return nextStatus;
  }

  function handleCellClick(row: number, col: number) {
    if (status !== 'IN_PROGRESS' || board[row][col] || submitting) return;

    const playerBoard = cloneBoard(board);
    playerBoard[row][col] = 'X';

    if (finishIfNeeded(playerBoard) !== 'IN_PROGRESS') {
      setBoard(playerBoard);
      return;
    }

    const botMove = getBotMove(playerBoard);
    if (botMove) {
      playerBoard[botMove.row][botMove.col] = 'O';
    }

    setBoard(playerBoard);
    finishIfNeeded(playerBoard);
  }

  function newGame() {
    setBoard(createInitialBoard());
    setStatus('IN_PROGRESS');
    setResultMessage('');
    setResultSubmitted(false);
    setError(null);
  }

  if (loading) return <Layout><LoadingState message="Loading game..." /></Layout>;

  return (
    <Layout>
      {error && <ErrorState message={error} />}
      <div className="game-grid">
        <ScorePanel user={user} />
        <section className="card">
          <h2>Player X vs Bot O</h2>
          <GameBoard board={board} disabled={status !== 'IN_PROGRESS' || submitting} onCellClick={handleCellClick} />
          <button className="secondary" onClick={newGame}>New Game</button>
        </section>
      </div>
      {status !== 'IN_PROGRESS' && (
        <GameResultModal status={status} message={resultMessage || 'Submitting result...'} onNewGame={newGame} />
      )}
    </Layout>
  );
}
