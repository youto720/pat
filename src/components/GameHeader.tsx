interface Props {
  totalScore: number;
  roundScore: number;
  timeLeftMs: number | null; // タイムアタック中のみ数値
  onMenu: () => void;
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function GameHeader({ totalScore, roundScore, timeLeftMs, onMenu }: Props) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        padding: '0 16px',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0,
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenu}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
        aria-label="menu"
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#333',
              borderRadius: '2px',
            }}
          />
        ))}
      </button>

      {/* Title / Timer */}
      {timeLeftMs != null ? (
        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: timeLeftMs < 10000 ? '#E87070' : '#333',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ⏱ {fmt(timeLeftMs)}
        </span>
      ) : (
        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#333',
            letterSpacing: '1px',
          }}
        >
          POPO
        </span>
      )}

      {/* Score */}
      <div style={{ textAlign: 'right', minWidth: '70px' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#333', lineHeight: 1 }}>
          {totalScore.toLocaleString()}
        </div>
        {roundScore > 0 && (
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>
            +{roundScore}
          </div>
        )}
      </div>
    </header>
  );
}
