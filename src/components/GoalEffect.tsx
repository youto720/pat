import { useEffect, useState } from 'react';

interface Props {
  score: number;
  goalCount: number;
}

interface Particle {
  id: number;
  tx: string;
  ty: string;
  color: string;
  size: number;
  duration: number;
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

export function GoalEffect({ score, goalCount }: Props) {
  const [particles] = useState(() => makeParticles(20));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const isLevelUp = goalCount % 3 === 0 || goalCount % 5 === 0;

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

      {/* GOAL text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          animation: 'goalTextPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: 'clamp(40px, 12vw, 72px)',
            fontWeight: 900,
            color: '#4CAF7D',
            textShadow: '0 2px 8px rgba(76, 175, 125, 0.4)',
            lineHeight: 1,
          }}
        >
          GOAL!
        </div>
        <div
          style={{
            fontSize: 'clamp(18px, 5vw, 28px)',
            fontWeight: 800,
            color: '#F4845F',
            animation: 'scoreFloat 1.5s ease-out 0.3s forwards',
            opacity: 1,
          }}
        >
          +{score}
        </div>
        {isLevelUp && (
          <div
            style={{
              fontSize: 'clamp(13px, 3.5vw, 18px)',
              fontWeight: 700,
              color: '#E87070',
              marginTop: '4px',
            }}
          >
            LEVEL UP!
          </div>
        )}
      </div>
    </div>
  );
}
