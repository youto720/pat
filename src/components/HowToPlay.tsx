import { MAIN_COLOR } from '../stores/settings';

interface Props {
  onClose: () => void;
}

// 将来ここに YouTube 埋め込みやプレイ動画を差し込む。
// 例: VIDEO_ID = 'xxxxxxxxxxx' を入れると iframe が表示される
const VIDEO_ID: string | null = null;

const h2: React.CSSProperties = {
  fontSize: '17px',
  fontWeight: 900,
  color: '#333',
  margin: '22px 0 6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const p: React.CSSProperties = {
  fontSize: '13.5px',
  fontWeight: 600,
  color: '#555',
  lineHeight: 1.7,
  margin: '0 0 6px',
};

const badge = (label: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '6px',
  backgroundColor: label === 'FILL' ? MAIN_COLOR : label === 'GOAL' ? '#d2541e' : '#666',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 900,
  letterSpacing: '1px',
});

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ ...p, marginBottom: '4px' }}>{children}</li>
  );
}

export function HowToPlay({ onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 210,
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
          width: 'min(94vw, 460px)',
          maxHeight: '86dvh',
          backgroundColor: '#fff',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー（固定） */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '19px', fontWeight: 900, color: '#333' }}>❓ HOW TO PLAY</span>
          <button
            onClick={onClose}
            aria-label="close howto"
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

        {/* 本文（ここがスクロールする） */}
        <div style={{ padding: '4px 20px 24px', overflowY: 'auto' }}>
          {VIDEO_ID && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                marginTop: '16px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
                title="How to play Po"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}

          <p style={{ ...p, marginTop: '16px' }}>
            『Po』は、画面上のブロックを指先でなぞって遊ぶ、シンプルで爽快なパズルゲームです。
            プレイヤーのスタイルに合わせて、3つのゲームモードでお楽しみいただけます。
          </p>

          <h3 style={h2}>
            <span style={badge('FILL')}>FILL</span>
            全てを塗りつぶす達成感
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>画面内のすべてのブロックを塗りつぶすモードです。</Bullet>
            <Bullet>
              色の異なる「スタートブロック」から指を離さずに、一筆書きの要領で順番にブロックをなぞり、
              全体のブロックをきれいに塗りつぶしましょう。
            </Bullet>
          </ul>

          <h3 style={h2}>
            <span style={badge('GOAL')}>GOAL</span>
            スコアを競う戦略性
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>障害物を避けながら、高得点でのゴールを目指すモードです。</Bullet>
            <Bullet>
              色の異なる「スタートブロック」から、ゴールである「赤い旗 🚩」を目指してブロックをなぞり進めます。
            </Bullet>
            <Bullet>すべてのブロックを塗りつぶす必要はありません。最善のルートを見つけましょう。</Bullet>
            <Bullet>
              道中には「爆弾 💣」の障害物が設置されていますが、「★（星）」のブロックをなぞることで爆弾を消去できます。
            </Bullet>
          </ul>

          <h3 style={h2}>
            <span style={badge('TIME')}>TIME</span>
            限界に挑むタイムアタック
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>制限時間内での最高スコアを目指す、ハラハラドキドキのモードです。</Bullet>
            <Bullet>
              「FILL」または「GOAL」のルールを選択し、決められた制限時間の中でどこまで高得点を獲得できるかに挑戦します。
            </Bullet>
          </ul>

          <h3 style={h2}>🎨 カスタマイズ</h3>
          <p style={p}>メニュー画面からは、ゲーム画面をあなた好みにアレンジできます。</p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>ブロックの色を自由にお好みのカラーへ変更できます。</Bullet>
            <Bullet>ブロックの背景にお気に入りの画像を設定して楽しめます。</Bullet>
          </ul>
        </div>
      </div>
    </div>
  );
}
