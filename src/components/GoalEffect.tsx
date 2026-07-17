import { useEffect, useState } from 'react';

interface Props {
  score: number;
  willGrow: boolean;
  perfect: boolean;
}

interface Particle {
  id: number;
  tx: string;
  ty: string;
  color: string;
  size: number;
  duration: number;
}

// クラッカーの紙吹雪（PERFECT 時のみ）
interface Confetti {
  id: number;
  left: string; // 発射位置（画面下の左右どちらか）
  cx: string;   // 山なり頂点までの移動量
  cy: string;
  cx2: string;  // 落下後の位置
  cy2: string;
  r1: string;   // 回転
  r2: string;
  color: string;
  w: number;
  h: number;
  duration: number;
  delay: number;
}

const COLORS = ['#F4845F', '#E87070', '#4CAF7D', '#FFD166', '#06D6A0', '#118AB2'];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
    const dist = 60 + Math.random() * 80;
    return {
      id: i,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      duration: 0.5 + Math.random() * 0.4,
    };
  });
}

// 画面下の左右2箇所から中央上方向へ「パーン」と打ち上げる
function makeConfetti(count: number): Confetti[] {
  return Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    // 内向き（左からは右上へ、右からは左上へ）
    const dirX = (fromLeft ? 1 : -1) * (40 + Math.random() * 160);
    const upY = -(180 + Math.random() * 260);
    return {
      id: i,
      left: fromLeft ? '8%' : '92%',
      cx: `${dirX}px`,
      cy: `${upY}px`,
      cx2: `${dirX * 1.3}px`,
      cy2: `${upY + 140 + Math.random() * 80}px`, // 頂点から少し落下
      r1: `${(Math.random() - 0.5) * 540}deg`,
      r2: `${(Math.random() - 0.5) * 1080}deg`,
      color: COLORS[i % COLORS.length],
      w: 5 + Math.random() * 4,
      h: 8 + Math.random() * 6,
      duration: 1.5,
      delay: Math.random() * 0.15,
    };
  });
}

export function GoalEffect({ score, willGrow, perfect }: Props) {
  const [particles] = useState(() => makeParticles(20));
  const [confetti] = useState(() => (perfect ? makeConfetti(26) : []));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.color,
            // @ts-expect-error CSS custom properties
            '--tx': p.tx,
            '--ty': p.ty,
            animation: `particleFly ${p.duration}s ease-out forwards`,
          }}
        />
      ))}

      {/* クラッカー紙吹雪（PERFECT のみ） */}
      {confetti.map(c => (
        <div
          key={`cf-${c.id}`}
          style={{
            position: 'absolute',
            left: c.left,
            bottom: '18%',
            width: `${c.w}px`,
            height: `${c.h}px`,
            borderRadius: '2px',
            backgroundColor: c.color,
            opacity: 0,
            // @ts-expect-error CSS custom properties
            '--cx': c.cx,
            '--cy': c.cy,
            '--cx2': c.cx2,
            '--cy2': c.cy2,
            '--r1': c.r1,
            '--r2': c.r2,
            animation: `confettiPop ${c.duration}s cubic-bezier(0.2, 0.8, 0.6, 1) ${c.delay}s forwards`,
          }}
        />
      ))}

      {/* GOAL / PERFECT text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          animation: 'goalTextPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          textAlign: 'center',
          // ★リキッドグラス風カード（同化防止）。ここを調整してください
          padding: '20px 36px',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '10px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: perfect ? 'clamp(34px, 10vw, 60px)' : 'clamp(40px, 12vw, 72px)',
            fontWeight: 900,
            color: perfect ? '#F0A500' : '#E87070',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {perfect ? 'PERFECT!!' : 'GOAL!'}
        </div>
        <div
          style={{
            fontSize: 'clamp(18px, 5vw, 28px)',
            fontWeight: 800,
            color: '#F4845F',
          }}
        >
          +{score}
        </div>
        {willGrow && (
          <div
            style={{
              fontSize: 'clamp(13px, 3.5vw, 18px)',
              fontWeight: 700,
              color: '#E87070',
              marginTop: '4px',
            }}
          >
            SIZE UP!
          </div>
        )}
      </div>
    </div>
  );
}
