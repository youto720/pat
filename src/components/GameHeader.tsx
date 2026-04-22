import { useState } from 'react';

interface Props {
  totalScore: number;
  goalCount: number;
  roundScore: number;
}

export function GameHeader({ totalScore, goalCount, roundScore }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          padding: '0 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E0E0E0',
          flexShrink: 0,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
          aria-label="メニュー"
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
                transition: 'transform 0.2s',
              }}
            />
          ))}
        </button>

        {/* Title */}
        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#333',
            letterSpacing: '-0.5px',
          }}
        >
          pat
        </span>

        {/* Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#333', lineHeight: 1 }}>
            {totalScore.toLocaleString()}
          </div>
          {roundScore > 0 && (
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>
              +{roundScore} pts
            </div>
          )}
        </div>
      </header>

      {/* Simple menu drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
          }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '240px',
              height: '100%',
              backgroundColor: '#fff',
              boxShadow: '4px 0 12px rgba(0,0,0,0.12)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 900, fontSize: '20px', marginBottom: '16px', color: '#333' }}>
              pat
            </div>
            <div style={{ color: '#555', fontSize: '14px', fontWeight: 600 }}>
              ゴール数: {goalCount}
            </div>
            <div style={{ color: '#555', fontSize: '14px', fontWeight: 600 }}>
              累計スコア: {totalScore.toLocaleString()}
            </div>
            <div
              style={{
                marginTop: 'auto',
                fontSize: '12px',
                color: '#aaa',
                fontWeight: 600,
              }}
            >
              Phase 1 v0.1
            </div>
          </div>
        </div>
      )}
    </>
  );
}
