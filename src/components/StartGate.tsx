import { useState } from 'react';
import { unlockAudio } from '../hooks/useSound';
import { MAIN_COLOR, MAIN_COLOR_RGB } from '../stores/settings';
import { Logo } from './Logo';
import { HowToPlay } from './HowToPlay';

interface Props {
  onStart: () => void;
}

export function StartGate({ onStart }: Props) {
  const [showHowTo, setShowHowTo] = useState(false);
  const handleStart = () => {
    // onClick is reliably recognised by iOS as a user gesture for audio.
    unlockAudio();
    onStart();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div style={{ marginBottom: '40px' }}>
        <Logo height={72} />
      </div>
      <button
        onClick={handleStart}
        style={{
          padding: '18px 48px',
          fontSize: '20px',
          fontWeight: 900,
          backgroundColor: MAIN_COLOR,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: `0 4px 12px rgba(${MAIN_COLOR_RGB}, 0.45)`,
          fontFamily: 'inherit',
          letterSpacing: '1px',
        }}
      >
        TAP TO START
      </button>

      <button
        onClick={() => setShowHowTo(true)}
        style={{
          marginTop: '16px',
          padding: '12px 32px',
          fontSize: '15px',
          fontWeight: 800,
          backgroundColor: 'transparent',
          color: '#666',
          border: '2px solid #E0E0E0',
          borderRadius: '10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          letterSpacing: '0.5px',
        }}
      >
        ❓ HOW TO PLAY
      </button>

      <div
        style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#aaa',
          fontWeight: 700,
        }}
      >
        🔊 SOUND ON
      </div>

      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
