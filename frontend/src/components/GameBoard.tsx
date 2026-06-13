import type { Board } from '../types/game';
import { Cell } from './Cell';

type GameBoardProps = {
  board: Board;
  disabled: boolean;
  onCellClick: (row: number, col: number) => void;
};

export function GameBoard({ board, disabled, onCellClick }: GameBoardProps) {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            disabled={disabled}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        )),
      )}
    </div>
  );
}
