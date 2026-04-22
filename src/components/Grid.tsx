import { useRef, useEffect, useCallback } from 'react';
import type { Cell } from '../types/game';
import type { useGameLogic } from '../hooks/useGameLogic';
import type { useSound } from '../hooks/useSound';

type GameLogic = ReturnType<typeof useGameLogic>;
type SoundAPI = ReturnType<typeof useSound>;

interface Props {
  game: GameLogic;
  sound: SoundAPI;
}

function getCellBg(cell: Cell): string {
  if (cell.type === 'start') return '#F4845F';
  if (cell.type === 'goal') return '#E87070';
  if (cell.visited) return '#4CAF7D';
  return '#F5F5F5';
}

function getCellLabel(cell: Cell): string {
  if (cell.type === 'start') return 'S';
  if (cell.type === 'goal') return 'G';
  return '';
}

export function Grid({ game, sound }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);

  // Keep latest handler functions accessible from stable event listeners
  const handlersRef = useRef({
    onCellStart: (_row: number, _col: number) => {},
    onCellEnter: (_row: number, _col: number) => {},
    onPointerEnd: () => {},
    unlockAudio: () => {},
  });

  const onCellStart = useCallback((row: number, col: number) => {
    if (game.cells[row]?.[col]?.type !== 'start') return;
    game.beginTrace(row, col);
    sound.playStep(0);
  }, [game, sound]);

  const onCellEnter = useCallback((row: number, col: number) => {
    if (!game.isTracing || game.isGoal) return;
    if (game.path.length === 0) return;

    const [lastRow, lastCol] = game.path[game.path.length - 1];
    if (row === lastRow && col === lastCol) return;

    const cell = game.cells[row]?.[col];
    if (!cell) return;

    // Revisited cell → reset
    if (cell.visited) {
      sound.playReset();
      game.resetTrace();
      return;
    }

    // Non-adjacent → ignore (finger moved fast)
    const dr = Math.abs(row - lastRow);
    const dc = Math.abs(col - lastCol);
    if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return;

    const isGoalCell = cell.type === 'goal';
    game.extendTrace(row, col);

    if (isGoalCell) {
      sound.playGoal();
    } else {
      sound.playStep(game.path.length);
    }
  }, [game, sound]);

  const onPointerEnd = useCallback(() => {
    if (game.isTracing && !game.isGoal) {
      sound.playReset();
      game.resetTrace();
    }
  }, [game, sound]);

  // Keep ref updated every render (no deps = runs after every render)
  useEffect(() => {
    handlersRef.current = { onCellStart, onCellEnter, onPointerEnd, unlockAudio: sound.unlockAudio };
  });

  // Touch events — must be non-passive to prevent scroll
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const getCellAt = (x: number, y: number): [number, number] => {
      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      const row = parseInt(target?.dataset.row ?? '-1');
      const col = parseInt(target?.dataset.col ?? '-1');
      return [row, col];
    };

    const onTouchStart = (e: TouchEvent) => {
      // Unlock FIRST (before preventDefault) so iOS keeps the user-activation flag intact
      handlersRef.current.unlockAudio();
      const t = e.touches[0];
      const [r, c] = getCellAt(t.clientX, t.clientY);
      if (r >= 0 && c >= 0) handlersRef.current.onCellStart(r, c);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // prevent page scroll while tracing
      const t = e.touches[0];
      const [r, c] = getCellAt(t.clientX, t.clientY);
      if (r >= 0 && c >= 0) handlersRef.current.onCellEnter(r, c);
    };

    const onTouchEnd = () => {
      // unlockAudio on touchend: iOS Chrome recognises touchend as a valid
      // user gesture for AudioContext.resume(), even if touchstart was not.
      void handlersRef.current.unlockAudio();
      handlersRef.current.onPointerEnd();
    };

    // touchstart: passive so it doesn't interfere with iOS gesture activation
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // intentionally empty — uses handlersRef

  // Mouse up anywhere in window
  useEffect(() => {
    const onMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        handlersRef.current.onPointerEnd();
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const { cols, rows } = game.config;
  const gapPx = 4;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '16px',
      }}
    >
      <div
        style={{
          border: '2px solid #E0E0E0',
          borderRadius: '12px',
          padding: '8px',
          backgroundColor: '#fafafa',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          animation: game.isGoal ? 'gridFlash 0.4s ease-out' : undefined,
        }}
      >
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: `${gapPx}px`,
            width: `min(calc(100vw - 80px), calc((100dvh - 120px) * ${cols / rows}))`,
            aspectRatio: `${cols} / ${rows}`,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none', // prevent iOS scroll/zoom without needing preventDefault
          }}
        >
          {game.cells.flat().map(cell => (
            <div
              key={`${cell.row}-${cell.col}`}
              className="cell"
              data-row={cell.row}
              data-col={cell.col}
              style={{
                backgroundColor: getCellBg(cell),
                border: `1.5px solid ${cell.visited || cell.type !== 'normal' ? 'transparent' : '#E0E0E0'}`,
                boxShadow: cell.visited && cell.type === 'normal'
                  ? '0 1px 4px rgba(76,175,125,0.3)'
                  : cell.type === 'start'
                  ? '0 1px 4px rgba(244,132,95,0.4)'
                  : cell.type === 'goal'
                  ? '0 1px 4px rgba(232,112,112,0.4)'
                  : 'none',
                transform: cell.visited && cell.type === 'normal' ? 'scale(0.96)' : 'scale(1)',
                transition: 'background-color 0.08s ease, transform 0.08s ease',
              }}
              onMouseDown={e => {
                e.preventDefault();
                isMouseDownRef.current = true;
                onCellStart(cell.row, cell.col);
              }}
              onMouseEnter={() => {
                if (isMouseDownRef.current) {
                  onCellEnter(cell.row, cell.col);
                }
              }}
            >
              {getCellLabel(cell)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
