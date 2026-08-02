import { useState } from 'react';
import { MAIN_COLOR, MAIN_COLOR_RGB } from '../stores/settings';

interface Props {
  onClose: () => void;
}

// 送信先はまだ未接続。Supabase / フォームサービスが決まったらここを差し替える。
// （送信処理を入れるまでは「送信できた」ように見せない）
const SUBMIT_ENDPOINT: string | null = null;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#999',
  letterSpacing: '1px',
  marginBottom: '4px',
  display: 'block',
};

const field: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '15px',
  fontWeight: 600,
  border: '2px solid #E0E0E0',
  borderRadius: '10px',
  backgroundColor: '#fff',
  color: '#333',
  fontFamily: 'inherit',
  outline: 'none',
};

export function ContactForm({ onClose }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit =
    username.trim() !== '' && emailOk && message.trim() !== '' && status !== 'sending';

  const submit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    setError('');

    if (!SUBMIT_ENDPOINT) {
      // 送信先が未設定なので、実際には送られない
      setStatus('error');
      setError('NOT CONNECTED YET');
      return;
    }

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'FAILED');
    }
  };

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
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(94vw, 420px)',
          maxHeight: '86dvh',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#333' }}>✉️ CONTACT</span>
          <button
            onClick={onClose}
            aria-label="close contact"
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

        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: '40px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: MAIN_COLOR, marginTop: '8px' }}>
              THANK YOU!
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                padding: '12px 32px',
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
        ) : (
          <>
            <div>
              <label style={label} htmlFor="cf-username">
                USERNAME
              </label>
              <input
                id="cf-username"
                style={field}
                value={username}
                maxLength={40}
                onChange={e => setUsername(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = MAIN_COLOR)}
                onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
              />
            </div>

            <div>
              <label style={label} htmlFor="cf-email">
                EMAIL
              </label>
              <input
                id="cf-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                style={field}
                value={email}
                maxLength={120}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = MAIN_COLOR)}
                onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
              />
              {email !== '' && !emailOk && (
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#E87070', marginTop: '4px' }}>
                  INVALID EMAIL
                </div>
              )}
            </div>

            <div>
              <label style={label} htmlFor="cf-message">
                MESSAGE
              </label>
              <textarea
                id="cf-message"
                style={{ ...field, minHeight: '120px', resize: 'vertical' }}
                value={message}
                maxLength={2000}
                onChange={e => setMessage(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = MAIN_COLOR)}
                onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
              />
            </div>

            {status === 'error' && (
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#E87070', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              style={{
                padding: '14px 0',
                fontSize: '17px',
                fontWeight: 900,
                border: 'none',
                borderRadius: '10px',
                backgroundColor: canSubmit ? MAIN_COLOR : '#ddd',
                color: '#fff',
                cursor: canSubmit ? 'pointer' : 'default',
                boxShadow: canSubmit ? `0 4px 12px rgba(${MAIN_COLOR_RGB}, 0.4)` : 'none',
                fontFamily: 'inherit',
                letterSpacing: '1px',
              }}
            >
              {status === 'sending' ? '...' : 'SEND'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
