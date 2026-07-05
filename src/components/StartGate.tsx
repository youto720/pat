import { unlockAudio } from '../hooks/useSound';
import { DEFAULT_COLORS } from '../stores/settings';
import { Logo } from './Logo';

interface Props {
  onStart: () => void;
}

export function StartGate({ onStart }: Props) {
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
          backgroundColor: DEFAULT_COLORS.cellColor,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102,204,255,0.45)',
          fontFamily: 'inherit',
          letterSpacing: '1px',
        }}
      >
        TAP TO START
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
    </div>
  );
}
