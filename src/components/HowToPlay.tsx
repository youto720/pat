import { MAIN_COLOR, ACCENT_COLOR } from '../stores/settings';

interface Props {
  onClose: () => void;
}

// 将来ここに YouTube 埋め込みやプレイ動画を差し込む。
// 例: VIDEO_ID = 'xxxxxxxxxxx' を入れると iframe が表示される
const VIDEO_ID: string | null = null;

const h2: React.CSSProperties = {
  fontSize: '13.5px',
  fontWeight: 900,
  color: '#333',
  margin: '22px 0 6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const lead: React.CSSProperties = {
  fontSize: '13.5px',
  fontWeight: 800,
  color: ACCENT_COLOR,
};

const p: React.CSSProperties = {
  fontSize: '13.5px',
  fontWeight: 600,
  color: '#555',
  lineHeight: 1.7,
  margin: '0 0 6px',
};

const badgeColor: Record<string, string> = {
  FILL: MAIN_COLOR,
  GOAL: ACCENT_COLOR,
  TIME: '#666',
  ENDLESS: '#8a5cc7',
};

const badge = (label: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '6px',
  backgroundColor: badgeColor[label] ?? '#666',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 900,
  letterSpacing: '1px',
});

function Bullet({ children }: { children: React.ReactNode }) {
  return <li style={{ ...p, marginBottom: '4px' }}>{children}</li>;
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
            『Po（ポ）』は、画面上のブロックをポポポポポ…と指先でなぞって遊ぶシンプルなパズルゲームです。
            スタイルに合わせて、4つのゲームモードでお楽しみいただけます。
          </p>

          <h3 style={h2}>
            <span style={badge('FILL')}>FILL</span>
            <span style={lead}>すべてを塗りつぶそう！</span>
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>画面内のすべてのブロックを一筆書きで塗りつぶすモードです。</Bullet>
            <Bullet>
              色の異なる「スタートブロック」から指を離さずに一筆書きの要領でブロックをなぞります。
            </Bullet>
            <Bullet>ブロック全体をきれいに塗りつぶそう！</Bullet>
          </ul>

          <h3 style={h2}>
            <span style={badge('GOAL')}>GOAL</span>
            <span style={lead}>スコアを競おう！</span>
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>障害物を避けながら、高得点でのゴールを目指すモードです。</Bullet>
            <Bullet>
              色の異なる「スタートブロック」から、ゴールである「赤いフラッグ」を目指してブロックをなぞり進めます。
            </Bullet>
            <Bullet>
              道中には「爆弾」の障害物が設置されていますが、「★（星）」のブロックをなぞることで爆弾を消去できます。
            </Bullet>
            <Bullet>すべてのブロックを塗りつぶす必要はありません。最善のルートを見つけよう！</Bullet>
          </ul>

          <h3 style={h2}>
            <span style={badge('TIME')}>TIME</span>
            <span style={lead}>タイムアタック！</span>
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>制限時間内での最高スコアを目指すハラハラドキドキのモードです。</Bullet>
            <Bullet>
              「FILL」または「GOAL」のルールを選択し、決められた制限時間の中でどこまで高得点を獲得できるか挑戦しよう！
            </Bullet>
          </ul>

          <h3 style={h2}>
            <span style={badge('ENDLESS')}>ENDLESS</span>
            <span style={lead}>限界に挑もう！</span>
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>「FILL」を時間無制限に楽しめるモードです。</Bullet>
            <Bullet>ゴールそれは次のスタートへ。思う存分塗りつぶそう！</Bullet>
          </ul>

          <h3 style={{ ...h2, marginTop: '28px' }}>■ カスタマイズしよう</h3>
          <p style={p}>メニューから、ゲーム画面をあなた好みにアレンジできます。</p>

          <p style={{ ...p, fontWeight: 900, color: '#333', margin: '12px 0 4px' }}>無料版</p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>ブロックの色をランダムモードに切り替えることができます</Bullet>
            <Bullet>ブロックの背景にお気に入りの画像（1枚）を設定して楽しめます</Bullet>
          </ul>

          <p style={{ ...p, fontWeight: 900, color: ACCENT_COLOR, margin: '14px 0 4px' }}>
            ★ PRO版（有償版）300円
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <Bullet>広告が非表示になります</Bullet>
            <Bullet>ブロックの色を自由に変更できます</Bullet>
            <Bullet>ブロックの背景にお気に入りの画像（最大10枚）を設定して楽しめます</Bullet>
            <Bullet>「FILL」のブロックサイズをランダムモードに変更できます</Bullet>
            <Bullet>「GOAL」のフラッグ、爆弾、星の絵文字を自由に変更できます</Bullet>
            <Bullet>「TIME」の制限時間を自由に設定できます</Bullet>
            <Bullet>「ENDLESS」のブロックサイズを5種類から選択できます</Bullet>
          </ul>
        </div>
      </div>
    </div>
  );
}
