import type { Cell as CellValue } from '../types/game';

type CellProps = {
  value: CellValue;
  disabled: boolean;
  onClick: () => void;
};

export function Cell({ value, disabled, onClick }: CellProps) {
  return (
    <button className="cell" disabled={disabled || value !== null} onClick={onClick} aria-label="board cell">
      {value}
    </button>
  );
}
