import { useRef, useEffect, useCallback } from 'react';
import type { Cell, Palette } from '../types/game';
import type { useGameLogic } from '../hooks/useGameLogic';
import type { useSound } from '../hooks/useSound';

type GameLogic = ReturnType<typeof useGameLogic>;
type SoundAPI = ReturnType<typeof useSound>;

interface Props {
  game: GameLogic;
  sound: SoundAPI;
  palette: Palette;
  bgImage: string | null;
  tapReveal: boolean;
  disabled?: boolean;
}

function cellSymbol(cell: Cell): string {
  if (cell.type === 'start') return 'S';
  if (cell.type === 'goal') return 'G';
  if (cell.type === 'mine') return '💣';
  if (cell.type === 'bonus') return '★';
  return '';
}

export function Grid({ game, sound, palette, bgImage, tapReveal, disabled = false }: Props) {
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
    if (disabled) return;
    if (game.cells[row]?.[col]?.type !== 'start') return;
    game.beginTrace(row, col);
    sound.playStep(0);
  }, [game, sound, disabled]);

  const onCellEnter = useCallback((row: number, col: number) => {
    if (disabled) return;
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

    // 地雷 → 失敗
    if (cell.type === 'mine') {
      sound.playFail();
      game.extendTrace(row, col);
      return;
    }

    // fill は全マス埋め、goal / time はゴールマス到達でクリア
    const willFinish =
      game.mode === 'fill'
        ? game.path.length + 1 === game.config.rows * game.config.cols
        : cell.type === 'goal';

    game.extendTrace(row, col);

    if (willFinish) {
      sound.playGoal();
    } else if (cell.type === 'bonus') {
      sound.playBonus();
    } else {
      sound.playStep(game.path.length);
    }
  }, [game, sound, disabled]);

  const onPointerEnd = useCallback(() => {
    if (disabled) return;
    if (game.isTracing && !game.isGoal) {
      sound.playReset();
      game.resetTrace();
    }
  }, [game, sound, disabled]);

  // Keep ref updated every render (no deps = runs after every render)
  useEffect(() => {
    handlersRef.current = { onCellStart, onCellEnter, onPointerEnd, unlockAudio: sound.unlockAudio };
  });

  // Touch events — must be non-passive to prevent scroll
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const getCellAt = (x: number, y: number): [number, number] => {
      // フリップ構造ではセル内部の face 要素がヒットするため closest で遡る
      const hit = document.elementFromPoint(x, y) as HTMLElement | null;
      const target = hit?.closest('[data-row]') as HTMLElement | null;
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

  // 表面（未タップ）の色。S/G/地雷/加点はそれぞれ見分けがつくように
  const frontBg = (cell: Cell): string => {
    if (cell.type === 'goal') return '#E87070';
    return palette.cell;
  };

  const frontFg = (cell: Cell): string => {
    if (cell.type === 'goal') return 'rgba(255,255,255,0.95)';
    if (cell.type === 'bonus') return '#B8860B';
    return 'rgba(255,255,255,0.9)';
  };

  // タップ後の裏面。背景画像 + REVEAL ON のときは、そのマス位置の画像断片を表示
  // （全マス埋めるとグリッド全体で1枚の画像が完成する）
  const backStyle = (cell: Cell): React.CSSProperties => {
    if (bgImage && tapReveal) {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${cols > 1 ? (cell.col / (cols - 1)) * 100 : 0}% ${
          rows > 1 ? (cell.row / (rows - 1)) * 100 : 0
        }%`,
      };
    }
    return { backgroundColor: palette.tap };
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '12px',
      }}
    >
      <div
        style={{
          border: '2px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          padding: '6px',
          backgroundColor: bgImage ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.03)',
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
            width: `min(calc(100vw - 40px), calc((100dvh - 104px) * ${cols / rows}))`,
            aspectRatio: `${cols} / ${rows}`,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none', // prevent iOS scroll/zoom without needing preventDefault
          }}
        >
          {game.cells.flat().map(cell => (
            <div
              key={`${cell.row}-${cell.col}`}
              className="cellWrap"
              data-row={cell.row}
              data-col={cell.col}
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
              <div
                className={`cellInner${cell.visited ? ' flipped' : ''}`}
                style={{
                  // カード側面の色（マス色を暗くしたもの。color-mix 非対応なら CSS 側の既定色）
                  ['--edge' as string]: `color-mix(in srgb, ${frontBg(cell)} 55%, #000)`,
                }}
              >
                {/* 厚み（上下の側面） */}
                <div className="cellSide cellSideTop" />
                <div className="cellSide cellSideBottom" />
                {/* 表面：未タップ */}
                <div
                  className="cellFace"
                  style={{
                    backgroundColor: frontBg(cell),
                    color: frontFg(cell),
                    border: cell.type === 'normal' ? '1.5px solid rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {cellSymbol(cell) && (
                    <span
                      className={
                        cell.type === 'mine' || cell.type === 'bonus' ? 'faceIcon' : 'faceLetter'
                      }
                    >
                      {cellSymbol(cell)}
                    </span>
                  )}
                </div>
                {/* 裏面：タップ後 */}
                <div
                  className="cellFace cellBack"
                  style={{
                    ...backStyle(cell),
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {cell.type === 'bonus' ? <span className="faceIcon">★</span> : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
