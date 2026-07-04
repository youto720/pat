import { useRef } from 'react';
import type { GameMode } from '../types/game';
import type { Settings } from '../stores/settings';
import { imageFileToDataUrl } from '../stores/settings';

interface Props {
  mode: GameMode;
  settings: Settings;
  onChangeMode: (mode: GameMode) => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onShowRank: () => void;
  onShowDebug: () => void;
  onClose: () => void;
}

const MODES: Array<{ id: GameMode; label: string }> = [
  { id: 'fill', label: 'FILL' },
  { id: 'goal', label: 'GOAL' },
  { id: 'time', label: 'TIME' },
];

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#999',
  letterSpacing: '1px',
  marginTop: '18px',
  marginBottom: '6px',
};

const rowBtn: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '14px',
  fontWeight: 800,
  border: '2px solid #E0E0E0',
  borderRadius: '10px',
  backgroundColor: '#fff',
  color: '#333',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
};

export function Menu({
  mode,
  settings,
  onChangeMode,
  onUpdateSettings,
  onShowRank,
  onShowDebug,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const fullscreenSupported =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await imageFileToDataUrl(file);
      onUpdateSettings({ bgImage: dataUrl });
    } catch {
      // 読めない画像は無視
    }
  };

  const colorRow = (label: string, key: 'bgColor' | 'cellColor' | 'tapColor') => (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 2px',
        fontSize: '13px',
        fontWeight: 700,
        color: settings.randomColors ? '#bbb' : '#333',
      }}
    >
      {label}
      <input
        type="color"
        value={settings[key]}
        disabled={settings.randomColors}
        onChange={e => onUpdateSettings({ [key]: e.target.value })}
        style={{
          width: '42px',
          height: '30px',
          border: 'none',
          padding: 0,
          background: 'none',
          cursor: settings.randomColors ? 'default' : 'pointer',
          opacity: settings.randomColors ? 0.4 : 1,
        }}
      />
    </label>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '260px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '4px 0 12px rgba(0,0,0,0.12)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          fontFamily: 'Nunito, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 900, fontSize: '22px', color: '#333' }}>POPO</div>

        {/* モード切替 */}
        <div style={sectionLabel}>MODE</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id)}
              style={{
                ...rowBtn,
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                backgroundColor: mode === m.id ? '#333' : '#fff',
                color: mode === m.id ? '#fff' : '#333',
                borderColor: mode === m.id ? '#333' : '#E0E0E0',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* カラー設定 */}
        <div style={sectionLabel}>COLOR</div>
        {colorRow('BG', 'bgColor')}
        {colorRow('CELL', 'cellColor')}
        {colorRow('TAP', 'tapColor')}
        <button
          onClick={() => onUpdateSettings({ randomColors: !settings.randomColors })}
          style={{
            ...rowBtn,
            marginTop: '4px',
            backgroundColor: settings.randomColors ? '#4CAF7D' : '#fff',
            color: settings.randomColors ? '#fff' : '#333',
            borderColor: settings.randomColors ? '#4CAF7D' : '#E0E0E0',
            textAlign: 'center',
          }}
        >
          RANDOM {settings.randomColors ? 'ON' : 'OFF'}
        </button>

        {/* 背景画像 */}
        <div style={sectionLabel}>BG IMAGE</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ ...rowBtn, flex: 1, textAlign: 'center' }}
            onClick={() => fileRef.current?.click()}
          >
            SET
          </button>
          <button
            style={{
              ...rowBtn,
              flex: 1,
              textAlign: 'center',
              opacity: settings.bgImage ? 1 : 0.4,
            }}
            disabled={!settings.bgImage}
            onClick={() => onUpdateSettings({ bgImage: null })}
          >
            CLEAR
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            void onPickImage(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        {/* タップしたマスに画像を表示（全部埋めると絵が完成） */}
        <button
          onClick={() => onUpdateSettings({ tapReveal: !settings.tapReveal })}
          disabled={!settings.bgImage}
          style={{
            ...rowBtn,
            marginTop: '6px',
            textAlign: 'center',
            backgroundColor: settings.bgImage && settings.tapReveal ? '#4CAF7D' : '#fff',
            color: !settings.bgImage ? '#bbb' : settings.tapReveal ? '#fff' : '#333',
            borderColor: settings.bgImage && settings.tapReveal ? '#4CAF7D' : '#E0E0E0',
            cursor: settings.bgImage ? 'pointer' : 'default',
          }}
        >
          REVEAL {settings.tapReveal ? 'ON' : 'OFF'}
        </button>

        {/* その他 */}
        <div style={sectionLabel}>MORE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {fullscreenSupported && (
            <button style={rowBtn} onClick={toggleFullscreen}>
              ⛶ FULL SCREEN
            </button>
          )}
          <button style={rowBtn} onClick={onShowRank}>
            🏆 RANK
          </button>
          <button style={{ ...rowBtn, color: '#aaa', cursor: 'default' }} disabled>
            👤 LOGIN (SOON)
          </button>
          <button style={rowBtn} onClick={onShowDebug}>
            🔊 SOUND CHECK
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '11px', color: '#bbb', fontWeight: 700 }}>
          POPO v0.2
        </div>
      </div>
    </div>
  );
}
