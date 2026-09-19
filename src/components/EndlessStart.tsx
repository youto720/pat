import { MAIN_COLOR, MAIN_COLOR_RGB } from '../stores/settings';
import { useIsPro } from '../stores/plan';
import { ENDLESS_DEFAULT_SIZE, ENDLESS_SIZES } from '../hooks/useGameLogic';

// ENDLESS 開始前のマス数選択。マス数の変更は PRO 限定（無料は 6x6 固定）
interface Props {
  size: number;
  onChangeSize: (size: number) => void;
  onStart: () => void;
  onCancel: () => void;
}

export function EndlessStart({ size, onChangeSize, onStart, onCancel }: Props) {
  const isPro = useIsPro();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(255,255,255,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>∞ ENDLESS</div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {ENDLESS_SIZES.map(n => {
          const selectable = isPro || n === ENDLESS_DEFAULT_SIZE;
          const selected = size === n;
          return (
            <button
              key={n}
              onClick={() => selectable && onChangeSize(n)}
              disabled={!selectable}
              aria-label={`size ${n}`}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '15px',
                fontWeight: 900,
                border: '3px solid',
                borderColor: selected ? '#333' : '#DDD',
                borderRadius: '50%',
                backgroundColor: selected ? '#333' : '#fff',
                color: selected ? '#fff' : selectable ? '#333' : '#bbb',
                cursor: selectable ? 'pointer' : 'default',
                fontFamily: 'inherit',
                opacity: selectable ? 1 : 0.55,
              }}
            >
              {n}×{n}
            </button>
          );
        })}
      </div>
      {!isPro && (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', letterSpacing: '0.5px', marginTop: '-10px' }}>
          ★ PRO: CHOOSE SIZE
        </div>
      )}

      <button
        onClick={onStart}
        style={{
          padding: '16px 48px',
          fontSize: '20px',
          fontWeight: 900,
          backgroundColor: MAIN_COLOR,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: `0 4px 12px rgba(${MAIN_COLOR_RGB}, 0.45)`,
          fontFamily: 'inherit',
        }}
      >
        START
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: '10px 32px',
          fontSize: '14px',
          fontWeight: 800,
          backgroundColor: 'transparent',
          color: '#999',
          border: '2px solid #DDD',
          borderRadius: '10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        CANCEL
      </button>
    </div>
  );
}
