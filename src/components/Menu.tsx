import { useRef, useState } from 'react';
import type { GameMode } from '../types/game';
import type { Settings } from '../stores/settings';
import {
  imageFileToDataUrl,
  DEFAULT_COLORS,
  MAIN_COLOR,
  MAX_BG_IMAGES_FREE,
  MAX_BG_IMAGES_PRO,
} from '../stores/settings';
import { DEV_PLAN_TOGGLE, useIsPro, useTogglePro } from '../stores/plan';

interface Props {
  mode: GameMode;
  settings: Settings;
  onChangeMode: (mode: GameMode) => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onShowRank: () => void;
  onShowDebug: () => void;
  onShowContact: () => void;
  onShowHowTo: () => void;
  onClose: () => void;
  saveError: boolean;
}

// ドロワーの幅。閉じる✕の位置計算にも使う
const DRAWER_WIDTH = 260;

const MODES: Array<{ id: GameMode; label: string }> = [
  { id: 'fill', label: 'FILL' },
  { id: 'goal', label: 'GOAL' },
  { id: 'time', label: 'TIME' },
  { id: 'endless', label: '∞ ENDLESS' },
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

// 開閉アニメーションの長さ（ms）
const ANIM_MS = 500;

export function Menu({
  mode,
  settings,
  onChangeMode,
  onUpdateSettings,
  onShowRank,
  onShowDebug,
  onShowContact,
  onShowHowTo,
  onClose,
  saveError,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isPro = useIsPro();
  const togglePro = useTogglePro();

  // 開閉は CSS アニメーションで行う（rAF はタブ非表示時に発火せず、
  // 開いたのに出てこない事故が起きうるため使わない）
  const [closing, setClosing] = useState(false);

  // 閉じるアニメーションを見せてから実際の処理（アンマウント等）を実行する
  const closeThen = (action: () => void) => {
    setClosing(true);
    setTimeout(action, ANIM_MS);
  };

  const fullscreenSupported =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  // 無料は1枚だけ（差し替え）、PRO は上限まで追加できる
  const images = settings.bgImages;
  const maxImages = isPro ? MAX_BG_IMAGES_PRO : MAX_BG_IMAGES_FREE;
  const canAddImage = images.length < maxImages || !isPro;

  // PRO は一度に複数枚選べる（上限まで取り込む）。無料は1枚だけ差し替え
  const onPickImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      if (!isPro) {
        onUpdateSettings({ bgImages: [await imageFileToDataUrl(files[0])] });
        return;
      }
      const room = MAX_BG_IMAGES_PRO - images.length;
      if (room <= 0) return;
      const picked = Array.from(files).slice(0, room);
      const urls = await Promise.all(picked.map(f => imageFileToDataUrl(f)));
      onUpdateSettings({ bgImages: [...images, ...urls].slice(0, MAX_BG_IMAGES_PRO) });
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
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={() => closeThen(onClose)}
    >
      {/* 閉じる✕。ドロワーの外に fixed で置くので、メニュー内をスクロールしても
          常に同じ位置に表示され続ける。位置はヘッダーのハンバーガーを
          ドロワー幅ぶん右にずらしたところ。開閉時はハンバーガーの位置から
          スライドして出入りする */}
      <button
        onClick={e => {
          e.stopPropagation();
          closeThen(onClose);
        }}
        aria-label="close menu"
        style={{
          position: 'fixed',
          top: 0,
          left: `${DRAWER_WIDTH + 16}px`,
          height: '56px',
          width: '38px',
          zIndex: 101,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // キーフレーム側で使うドロワー幅
          ['--drawer-w' as string]: `${DRAWER_WIDTH}px`,
          animation: `${closing ? 'menuXOut' : 'menuXIn'} ${ANIM_MS}ms ease both`,
        }}
      >
        <span style={{ position: 'relative', display: 'block', width: '22px', height: '22px' }}>
          {[45, -45].map(deg => (
            <span
              key={deg}
              style={{
                position: 'absolute',
                top: '10px',
                left: 0,
                display: 'block',
                width: '22px',
                height: '2px',
                backgroundColor: '#333',
                borderRadius: '2px',
                transform: `rotate(${deg}deg)`,
              }}
            />
          ))}
        </span>
      </button>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${DRAWER_WIDTH}px`,
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '4px 0 12px rgba(0,0,0,0.12)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          fontFamily: 'Nunito, sans-serif',
          animation: `${closing ? 'drawerOut' : 'drawerIn'} ${ANIM_MS}ms ease both`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ロゴはヘッダー中央に常時表示されているため、ドロワー上部には置かない */}

        {/* モード切替 */}
        <div style={sectionLabel}>MODE</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => closeThen(() => onChangeMode(m.id))}
              style={{
                ...rowBtn,
                flex: '1 1 45%',
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
        <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          COLOR
          <button
            onClick={() => onUpdateSettings({ ...DEFAULT_COLORS })}
            style={{
              border: '1.5px solid #E0E0E0',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#999',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
            }}
          >
            RESET
          </button>
        </div>
        {colorRow('BG', 'bgColor')}
        {colorRow('CELL', 'cellColor')}
        {colorRow('TAP', 'tapColor')}
        {/* ランダムカラー：トグルスイッチ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 2px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#333',
          }}
        >
          RANDOM
          <button
            onClick={() => onUpdateSettings({ randomColors: !settings.randomColors })}
            aria-pressed={settings.randomColors}
            style={{
              position: 'relative',
              width: '46px',
              height: '26px',
              borderRadius: '13px',
              border: 'none',
              backgroundColor: settings.randomColors ? MAIN_COLOR : '#ccc',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: settings.randomColors ? '22px' : '2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                transition: 'left 0.15s ease',
              }}
            />
          </button>
        </div>

        {/* 背景画像（PRO は複数枚 → ラウンドごとにランダム表示） */}
        <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between' }}>
          <span>BG IMAGE</span>
          <span style={{ color: '#bbb' }}>
            {images.length}/{maxImages}
            {isPro && ' ★'}
          </span>
        </div>

        {/* サムネイル一覧（個別に削除できる） */}
        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
            {images.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img
                  src={src}
                  alt=""
                  style={{
                    width: '46px',
                    height: '46px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block',
                    border: '1px solid #E0E0E0',
                  }}
                />
                <button
                  onClick={() => onUpdateSettings({ bgImages: images.filter((_, j) => j !== i) })}
                  aria-label={`remove image ${i + 1}`}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#333',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 900,
                    lineHeight: 1,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{
              ...rowBtn,
              flex: 1,
              textAlign: 'center',
              opacity: canAddImage ? 1 : 0.4,
              cursor: canAddImage ? 'pointer' : 'default',
            }}
            disabled={!canAddImage}
            onClick={() => fileRef.current?.click()}
          >
            {isPro && images.length > 0 ? 'ADD' : 'SET'}
          </button>
          <button
            style={{
              ...rowBtn,
              flex: 1,
              textAlign: 'center',
              opacity: images.length > 0 ? 1 : 0.4,
            }}
            disabled={images.length === 0}
            onClick={() => onUpdateSettings({ bgImages: [] })}
          >
            CLEAR
          </button>
        </div>
        {!isPro && (
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', marginTop: '4px' }}>
            ★ PRO: UP TO {MAX_BG_IMAGES_PRO} IMAGES, RANDOM EACH ROUND
          </div>
        )}
        {saveError && (
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#E87070', marginTop: '4px' }}>
            STORAGE FULL — NOT SAVED
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={isPro}
          style={{ display: 'none' }}
          onChange={e => {
            void onPickImages(e.target.files);
            e.target.value = '';
          }}
        />

        {/* その他 */}
        <div style={sectionLabel}>MORE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {fullscreenSupported && (
            <button style={rowBtn} onClick={toggleFullscreen}>
              ⛶ FULL SCREEN
            </button>
          )}
          <button style={rowBtn} onClick={() => closeThen(onShowRank)}>
            🏆 RANK
          </button>
          <button style={{ ...rowBtn, color: '#aaa', cursor: 'default' }} disabled>
            👤 LOGIN (SOON)
          </button>
          <button style={rowBtn} onClick={() => closeThen(onShowHowTo)}>
            ❓ HOW TO PLAY
          </button>
          <button style={rowBtn} onClick={() => closeThen(onShowContact)}>
            ✉️ FEEDBACK / CONTACT
          </button>
          <button style={rowBtn} onClick={() => closeThen(onShowDebug)}>
            🔊 SOUND CHECK
          </button>
        </div>

        {/* 開発用：有料機能の確認のためプランを切り替える（本番ビルドには出ない） */}
        {DEV_PLAN_TOGGLE && (
          <>
            <div style={sectionLabel}>DEV</div>
            <button
              onClick={togglePro}
              style={{
                ...rowBtn,
                textAlign: 'center',
                backgroundColor: isPro ? '#F0A500' : '#fff',
                color: isPro ? '#fff' : '#333',
                borderColor: isPro ? '#F0A500' : '#E0E0E0',
              }}
            >
              {isPro ? '★ PRO' : 'FREE'}
            </button>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '11px', color: '#bbb', fontWeight: 700 }}>
          Po v0.3{isPro ? ' · PRO' : ''}
        </div>
      </div>
    </div>
  );
}
