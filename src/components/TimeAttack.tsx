import { getUserName } from '../stores/ranking';
import { MAIN_COLOR, MAIN_COLOR_RGB } from '../stores/settings';
import { useIsPro } from '../stores/plan';

// ─── スタートパネル（TIME モードで未開始のとき） ───────────────────────
// duration は秒単位
export const TA_DURATIONS: Array<{ sec: number; label: string }> = [
  { sec: 30, label: '30s' },
  { sec: 60, label: '1m' },
  { sec: 180, label: '3m' },
];

// PRO の自由設定で許す範囲（秒）
export const TA_MIN_SEC = 5;
export const TA_MAX_SEC = 3600;

export type TaRule = 'fill' | 'goal' | 'endless';

const TA_RULES: Array<{ id: TaRule; label: string }> = [
  { id: 'fill', label: 'FILL' },
  { id: 'goal', label: 'GOAL' },
  { id: 'endless', label: '∞' },
];

interface StartProps {
  duration: number;
  onChangeDuration: (sec: number) => void;
  mode: TaRule;
  onChangeMode: (mode: TaRule) => void;
  onStart: () => void;
  onCancel: () => void;
}

export function TimeAttackStart({
  duration,
  onChangeDuration,
  mode,
  onChangeMode,
  onStart,
  onCancel,
}: StartProps) {
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
      <div style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>⏱ TIME ATTACK</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {TA_DURATIONS.map(d => (
          <button
            key={d.sec}
            onClick={() => onChangeDuration(d.sec)}
            style={{
              width: '64px',
              height: '64px',
              fontSize: '18px',
              fontWeight: 900,
              border: '3px solid',
              borderColor: duration === d.sec ? '#333' : '#DDD',
              borderRadius: '50%',
              backgroundColor: duration === d.sec ? '#333' : '#fff',
              color: duration === d.sec ? '#fff' : '#333',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      {/* PRO: 秒数を自由に指定できる */}
      {isPro ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#999', letterSpacing: '1px' }}>
            ★ CUSTOM
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={TA_MIN_SEC}
            max={TA_MAX_SEC}
            value={duration}
            onChange={e => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) {
                onChangeDuration(Math.min(TA_MAX_SEC, Math.max(TA_MIN_SEC, Math.round(v))));
              }
            }}
            style={{
              width: '84px',
              padding: '8px 10px',
              fontSize: '15px',
              fontWeight: 800,
              textAlign: 'center',
              border: '2px solid #DDD',
              borderRadius: '10px',
              fontFamily: 'inherit',
              color: '#333',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#999' }}>sec</span>
        </div>
      ) : (
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', letterSpacing: '0.5px' }}>
          ★ PRO: SET ANY TIME
        </div>
      )}

      {/* ルール選択（FILL: 全マス埋め / GOAL: 🚩到達 / ∞: 途切れず続ける） */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {TA_RULES.map(r => (
          <button
            key={r.id}
            onClick={() => onChangeMode(r.id)}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 900,
              border: '2px solid',
              borderColor: mode === r.id ? '#333' : '#DDD',
              borderRadius: '10px',
              backgroundColor: mode === r.id ? '#333' : '#fff',
              color: mode === r.id ? '#fff' : '#333',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '1px',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
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
              backgroundColor: MAIN_COLOR,
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
