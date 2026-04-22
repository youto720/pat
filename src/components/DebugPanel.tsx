import { useEffect, useState } from 'react';
import {
  unlockAudio,
  getAudioDebugInfo,
  getAudioLogs,
  clearAudioLogs,
} from '../hooks/useSound';
import type { useSound } from '../hooks/useSound';

type SoundAPI = ReturnType<typeof useSound>;

interface Props {
  sound: SoundAPI;
  onClose: () => void;
}

export function DebugPanel({ sound, onClose }: Props) {
  const [info, setInfo] = useState(getAudioDebugInfo());
  const [audioLogs, setAudioLogs] = useState<string[]>(getAudioLogs());
  const [log, setLog] = useState<string[]>([]);

  const refresh = () => {
    setInfo(getAudioDebugInfo());
    setAudioLogs(getAudioLogs());
  };
  const addLog = (m: string) => {
    const stamp = new Date().toISOString().slice(11, 19);
    setLog(prev => [...prev.slice(-14), `${stamp} ${m}`]);
  };

  useEffect(() => {
    const t = setInterval(refresh, 500);
    return () => clearInterval(t);
  }, []);

  const btnStyle: React.CSSProperties = {
    padding: '12px 8px',
    fontSize: '13px',
    fontWeight: 700,
    border: '2px solid #333',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        zIndex: 1000,
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        color: '#222',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ fontSize: '18px' }}>Audio Debug</strong>
        <button onClick={onClose} style={{ ...btnStyle, width: 'auto', padding: '6px 12px' }}>
          閉じる
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <button
          style={{ ...btnStyle, backgroundColor: '#F4845F', color: '#fff', borderColor: '#F4845F' }}
          onClick={() => {
            addLog('▶ unlockAudio()');
            void unlockAudio();
            setTimeout(refresh, 300);
          }}
        >
          ① unlockAudio
        </button>

        <button
          style={{ ...btnStyle, backgroundColor: '#4CAF7D', color: '#fff', borderColor: '#4CAF7D' }}
          onClick={() => {
            addLog('▶ playStep(0)');
            sound.playStep(0);
          }}
        >
          ② playStep
        </button>

        <button
          style={{ ...btnStyle, backgroundColor: '#E87070', color: '#fff', borderColor: '#E87070' }}
          onClick={() => {
            addLog('▶ playGoal()');
            sound.playGoal();
          }}
        >
          ③ playGoal
        </button>

        <button
          style={btnStyle}
          onClick={() => {
            addLog('▶ playReset()');
            sound.playReset();
          }}
        >
          ④ playReset
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          marginBottom: '12px',
          lineHeight: 1.5,
        }}
      >
        <div style={{ color: info.webAudioOk ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
          <b>webAudioOk:</b> {String(info.webAudioOk)}
        </div>
        <div style={{ color: info.ctxState === 'running' ? '#2e7d32' : '#c62828' }}>
          <b>ctxState:</b> {info.ctxState}
        </div>
        <div><b>ctxExists:</b> {String(info.ctxExists)}</div>
        <div><b>sampleRate:</b> {info.sampleRate}</div>
        <div><b>currentTime:</b> {info.currentTime.toFixed(3)}</div>
        {info.lastError && (
          <div style={{ color: '#c62828', marginTop: '4px' }}>
            <b>lastError:</b> {info.lastError}
          </div>
        )}
        <div style={{ marginTop: '4px', fontSize: '10px', color: '#666', wordBreak: 'break-all' }}>
          <b>UA:</b> {info.userAgent}
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#1e1e1e',
          color: '#c7f2c7',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          minHeight: '100px',
          maxHeight: '200px',
          overflowY: 'auto',
          marginBottom: '12px',
        }}
      >
        {log.length === 0 ? <i style={{ color: '#888' }}>ボタンを押すとログが出ます</i> : null}
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <strong style={{ fontSize: '12px' }}>Audio internal log:</strong>
        <button
          onClick={() => { clearAudioLogs(); refresh(); }}
          style={{ ...btnStyle, width: 'auto', padding: '4px 10px', fontSize: '11px' }}
        >
          clear
        </button>
      </div>
      <div
        style={{
          backgroundColor: '#0b3d0b',
          color: '#a7f2a7',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '10px',
          fontFamily: 'ui-monospace, monospace',
          minHeight: '120px',
          maxHeight: '220px',
          overflowY: 'auto',
        }}
      >
        {audioLogs.length === 0 ? <i style={{ color: '#6a9' }}>no internal logs yet</i> : null}
        {audioLogs.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
        手順: このパネルを閉じてゲームをプレイ → 再度 Debug を開いて internal log を確認。
      </div>
    </div>
  );
}
