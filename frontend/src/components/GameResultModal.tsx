import type { GameStatus } from '../types/game';

type FinishedStatus = Exclude<GameStatus, 'IN_PROGRESS' | 'ABANDONED'>;

const labels: Record<FinishedStatus, string> = {
  PLAYER_WIN: 'You win!',
  BOT_WIN: 'Bot wins',
  DRAW: 'Draw',
};

export function GameResultModal({
  status,
  message,
  onNewGame,
}: {
  status: FinishedStatus;
  message?: string;
  onNewGame: () => void;
}) {
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2>{labels[status]}</h2>
        {message && <p>{message}</p>}
        <button onClick={onNewGame}>New Game</button>
      </div>
    </div>
  );
}
