import { useEffect, useState } from 'react';

// 広告のプレースホルダ。
// 本番では AdSense (Ad Placement API) / AdMob のコードに差し替える。

// ─── 画面下の固定バナー枠（高さ60px） ─────────────────────────────────
export const AD_BANNER_HEIGHT = 60;

export function AdBanner() {
  return (
    <footer
      style={{
        height: `${AD_BANNER_HEIGHT}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#bbb',
          letterSpacing: '3px',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        AD
      </span>
    </footer>
  );
}

// ─── 全画面インタースティシャル（10ステージクリアごと） ─────────────────
interface InterstitialProps {
  onClose: () => void;
}

export function AdInterstitial({ onClose }: InterstitialProps) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCanClose(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        style={{
          width: 'min(80vw, 320px)',
          aspectRatio: '3 / 4',
          backgroundColor: '#fff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 900, color: '#ccc', letterSpacing: '4px' }}>
          AD
        </span>
        {canClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-14px',
              right: '-14px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#fff',
              color: '#333',
              fontSize: '18px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
