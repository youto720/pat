import { useState } from 'react';
import { getRanks, getUserName } from '../stores/ranking';
import type { RankPeriod } from '../stores/ranking';

interface Props {
  onClose: () => void;
}

const PERIODS: Array<{ id: RankPeriod; label: string }> = [
  { id: 'today', label: 'TODAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'lastMonth', label: 'LAST MONTH' },
];

export function Ranking({ onClose }: Props) {
  const [period, setPeriod] = useState<RankPeriod>('today');
  const ranks = getRanks(period);
  const me = getUserName();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(92vw, 380px)',
          maxHeight: '80dvh',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#333' }}>🏆 RANK</span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '20px',
              fontWeight: 900,
              color: '#999',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', marginBottom: '10px' }}>
          YOU: {me}
        </div>

        {/* 期間タブ */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: '11px',
                fontWeight: 800,
                border: '2px solid',
                borderColor: period === p.id ? '#333' : '#E0E0E0',
                borderRadius: '8px',
                backgroundColor: period === p.id ? '#333' : '#fff',
                color: period === p.id ? '#fff' : '#333',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {ranks.length === 0 && (
            <div style={{ textAlign: 'center', color: '#bbb', fontWeight: 700, padding: '32px 0' }}>
              NO DATA
            </div>
          )}
          {ranks.map((e, i) => (
            <div
              key={`${e.ts}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 6px',
                borderBottom: '1px solid #F0F0F0',
                backgroundColor: e.name === me ? 'rgba(76,175,125,0.08)' : 'transparent',
                borderRadius: '6px',
              }}
            >
              <span style={{ width: '26px', fontWeight: 900, color: i < 3 ? '#F4845F' : '#999' }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, fontWeight: 800, color: '#333' }}>{e.name}</span>
              <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 700 }}>{e.duration}m</span>
              <span style={{ fontWeight: 900, color: '#333' }}>{e.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
