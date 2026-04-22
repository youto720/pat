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
          fontSize: 'clamp(36px, 10vw, 56px)',
          fontWeight: 900,
          color: '#333',
          marginBottom: '8px',
        }}
      >
        pat
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#888',
          marginBottom: '40px',
          fontWeight: 600,
        }}
      >
        なぞって繋ぐ一筆書きパズル
      </div>
      <button
        onClick={handleStart}
        style={{
          padding: '18px 40px',
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
        タップしてスタート
      </button>
      <div
        style={{
          marginTop: '24px',
          fontSize: '11px',
          color: '#aaa',
          fontWeight: 600,
          maxWidth: '280px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        音を鳴らすため、一度タップしてください
      </div>
    </div>
  );
}
