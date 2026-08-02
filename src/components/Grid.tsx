import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import type { Cell, Palette } from '../types/game';
import type { useGameLogic } from '../hooks/useGameLogic';
import type { useSound } from '../hooks/useSound';
import { isBlinkOn } from '../utils/blink';
import { AD_BANNER_HEIGHT } from './Ad';
import { useIsPro } from '../stores/plan';

type GameLogic = ReturnType<typeof useGameLogic>;
type SoundAPI = ReturnType<typeof useSound>;

interface Props {
  game: GameLogic;
  sound: SoundAPI;
  palette: Palette;
  bgImage: string | null;
  disabled?: boolean;
}

function cellSymbol(cell: Cell): string {
  // スタートマスは全モード共通で文字なし（TAP色で示す）
  if (cell.type === 'goal') return '🚩';
  if (cell.type === 'mine') return '💣';
  if (cell.type === 'bonus') return '★';
  return '';
}

export function Grid({ game, sound, palette, bgImage, disabled = false }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const isPro = useIsPro();

  // Keep latest handler functions accessible from stable event listeners
  const handlersRef = useRef({
    onCellStart: (_row: number, _col: number) => {},
    onCellEnter: (_row: number, _col: number) => {},
    onPointerEnd: () => {},
    unlockAudio: () => {},
  });

  const onCellStart = useCallback((row: number, col: number) => {
    if (disabled) return;
    game.beginTrace(row, col);
  }, [game, disabled]);

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
      game.resetTrace();
      return;
    }

    // 成否・種別の判定と効果音イベントの発行はロジック側が行う
    game.extendTrace(row, col);
  }, [game, disabled]);

  const onPointerEnd = useCallback(() => {
    if (disabled) return;
    if (game.isTracing && !game.isGoal) {
      game.resetTrace();
    }
  }, [game, disabled]);

  // ロジックが発行した効果音イベントを1回だけ再生する。
  // タッチ処理時の状態判定に依存しないため、再レンダーのタイミングに
  // かかわらず「状態が変わったのに音が鳴らない」ことがない
  const lastSoundIdRef = useRef(0);
  useEffect(() => {
    const ev = game.soundEvent;
    if (!ev || ev.id === lastSoundIdRef.current) return;
    lastSoundIdRef.current = ev.id;
    switch (ev.kind) {
      case 'step': sound.playStep(ev.step ?? 0); break;
      case 'bonus': sound.playBonus(); break;
      case 'goal': sound.playGoal(); break;
      case 'perfect': sound.playPerfect(); break;
      case 'fail': sound.playFail(); break;
      case 'reset': sound.playReset(); break;
    }
  }, [game.soundEvent, sound]);

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

  // 点滅地雷の表示更新用クロック（値が変わったときだけ再レンダー）
  const [blinkOn, setBlinkOn] = useState(isBlinkOn);
  useEffect(() => {
    const iv = setInterval(() => setBlinkOn(isBlinkOn()), 100);
    return () => clearInterval(iv);
  }, []);

  // 背景画像の元サイズ（縦横比の維持に使う）
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!bgImage) {
      setImgSize(null);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = bgImage;
    return () => {
      alive = false;
    };
  }, [bgImage]);

  const { cols, rows } = game.config;
  const gapPx = 4;

  // グリッドの実サイズ（マスごとの画像切り出し位置の計算に使う）。
  // ResizeObserver はタブ非表示だと発火しないので、サイズが変わる契機
  // （行列数の変化・ウィンドウリサイズ）で自前に測る
  const [gridSize, setGridSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setGridSize(prev =>
        prev && Math.abs(prev.w - r.width) < 0.5 && Math.abs(prev.h - r.height) < 0.5
          ? prev
          : { w: r.width, h: r.height }
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cols, rows, bgImage]);

  // 表面（未タップ）の色。スタートは TAP 色、それ以外はマス色
  const frontBg = (cell: Cell): string => {
    if (cell.type === 'start') return palette.tap;
    return palette.cell;
  };

  const frontFg = (cell: Cell): string => {
    if (cell.type === 'bonus') return '#B8860B';
    return 'rgba(255,255,255,0.9)';
  };

  // グリッド全体に対して object-fit: cover / object-position: center 相当に
  // 画像を配置したときの、表示サイズと左上オフセット（px）
  const coverLayout = (() => {
    if (!bgImage || !imgSize || !gridSize) return null;
    const scale = Math.max(gridSize.w / imgSize.w, gridSize.h / imgSize.h);
    const dw = imgSize.w * scale;
    const dh = imgSize.h * scale;
    return { dw, dh, ox: (gridSize.w - dw) / 2, oy: (gridSize.h - dh) / 2 };
  })();

  // タップ後の裏面。背景画像があれば、そのマス位置の画像断片を表示
  // （全マス埋めるとグリッド全体で1枚の画像が完成する）
  const backStyle = (cell: Cell): React.CSSProperties => {
    if (bgImage && coverLayout && gridSize) {
      // グリッド内でのこのマスの左上位置（gap を含む）
      const cellW = (gridSize.w - gapPx * (cols - 1)) / cols;
      const cellH = (gridSize.h - gapPx * (rows - 1)) / rows;
      const cellLeft = cell.col * (cellW + gapPx);
      const cellTop = cell.row * (cellH + gapPx);
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: `${coverLayout.dw}px ${coverLayout.dh}px`,
        backgroundPosition: `${coverLayout.ox - cellLeft}px ${coverLayout.oy - cellTop}px`,
        backgroundRepeat: 'no-repeat',
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
          // 枠は視覚的に非表示（gridFlash 演出のため要素自体は残す）
          border: 'none',
          padding: 0,
          backgroundColor: 'transparent',
          boxShadow: 'none',
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
            width: `min(calc(100vw - 40px), calc((100dvh - ${
              104 + (isPro ? 0 : AD_BANNER_HEIGHT)
            }px) * ${cols / rows}))`,
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
                      className="faceIcon"
                      style={
                        cell.type === 'mine' && cell.blink
                          ? { opacity: blinkOn ? 1 : 0.12, transition: 'opacity 0.25s ease' }
                          : undefined
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
