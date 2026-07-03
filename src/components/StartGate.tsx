import { unlockAudio } from '../hooks/useSound';

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
      <div
        style={{
          fontSize: 'clamp(48px, 14vw, 72px)',
          fontWeight: 900,
          color: '#333',
          letterSpacing: '4px',
          marginBottom: '40px',
        }}
      >
        POPO
      </div>
      <button
        onClick={handleStart}
        style={{
          padding: '18px 48px',
          fontSize: '20px',
          fontWeight: 900,
          backgroundColor: '#F4845F',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(244,132,95,0.4)',
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
