import { getUserName } from '../stores/ranking';

// ─── スタートパネル（TIME モードで未開始のとき） ───────────────────────
interface StartProps {
  duration: number;
  onChangeDuration: (min: number) => void;
  onStart: () => void;
}

export function TimeAttackStart({ duration, onChangeDuration, onStart }: StartProps) {
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
      <div style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>⏱ TIME ATTACK</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[1, 3, 5].map(min => (
          <button
            key={min}
            onClick={() => onChangeDuration(min)}
            style={{
              width: '64px',
              height: '64px',
              fontSize: '18px',
              fontWeight: 900,
              border: '3px solid',
              borderColor: duration === min ? '#333' : '#DDD',
              borderRadius: '50%',
              backgroundColor: duration === min ? '#333' : '#fff',
              color: duration === min ? '#fff' : '#333',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {min}m
          </button>
        ))}
      </div>
      <button
        onClick={onStart}
        style={{
          padding: '16px 48px',
          fontSize: '20px',
          fontWeight: 900,
          backgroundColor: '#F4845F',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(244,132,95,0.4)',
          fontFamily: 'inherit',
        }}
      >
        START
      </button>
    </div>
  );
}

// ─── タイムアップ結果 ──────────────────────────────────────────────────
interface ResultProps {
  score: number;
  stages: number;
  onShowRank: () => void;
  onClose: () => void;
}

export function TimeAttackResult({ score, stages, onShowRank, onClose }: ResultProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        style={{
          width: 'min(88vw, 340px)',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#E87070' }}>TIME UP!</div>
        <div style={{ fontSize: '44px', fontWeight: 900, color: '#333', margin: '12px 0 2px' }}>
          {score.toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#999', marginBottom: '4px' }}>
          STAGE ×{stages}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#bbb', marginBottom: '20px' }}>
          {getUserName()}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onShowRank}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '15px',
              fontWeight: 900,
              border: '2px solid #333',
              borderRadius: '10px',
              backgroundColor: '#fff',
              color: '#333',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🏆 RANK
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '15px',
              fontWeight: 900,
              border: 'none',
              borderRadius: '10px',
              backgroundColor: '#F4845F',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
