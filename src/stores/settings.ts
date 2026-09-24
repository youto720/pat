import { useState, useCallback, useEffect, useRef } from 'react';
import { loadImages, saveImages } from './imageStore';

export interface Settings {
  bgColor: string;
  cellColor: string;
  tapColor: string;
  randomColors: boolean;
  randomSize: boolean; // FILL / GOAL でマス数をラウンドごとにランダムにする
  bgImages: string[]; // data URL の配列（PRO は複数枚もてる）
  // GOAL モードのマス絵文字（変更は PRO 限定）
  iconGoal: string;
  iconMine: string;
  iconBonus: string;
}

export const DEFAULT_ICONS = { iconGoal: '🚩', iconMine: '💣', iconBonus: '★' };

const KEY = 'popo_settings';

// 無料は1枚だけ、PRO は複数枚を登録してラウンドごとにランダム表示
export const MAX_BG_IMAGES_FREE = 1;
export const MAX_BG_IMAGES_PRO = 10;

// アプリのメインカラー。ボタンなどの UI アクセントはすべてここを参照する
export const MAIN_COLOR = '#00aeec'; // ロゴ「P」の水色
export const MAIN_COLOR_RGB = '0, 174, 236'; // 影などで rgba() を作る用
// アクセントカラー（ロゴ「o」のオレンジ）。クリア時の文字・スコアなどに使う
export const ACCENT_COLOR = '#eb5f2c';

export const DEFAULT_COLORS = {
  bgColor: '#ffffff',
  cellColor: MAIN_COLOR,
  tapColor: ACCENT_COLOR,
};

const DEFAULTS: Settings = {
  ...DEFAULT_COLORS,
  randomColors: true,
  randomSize: false,
  bgImages: [],
  ...DEFAULT_ICONS,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<Settings> & { bgImage?: string | null };
    // 旧形式（bgImage 単体）からの移行
    const bgImages = saved.bgImages ?? (saved.bgImage ? [saved.bgImage] : []);
    // 旧デフォルト色のまま保存されていたら、新しいロゴの色に置き換える
    const migrate = (v: string | undefined, olds: string[], now: string) =>
      v && olds.includes(v.toLowerCase()) ? now : v;
    const cellColor = migrate(saved.cellColor, ['#66ccff', '#2fb6b3', '#38a7d0'], MAIN_COLOR);
    const tapColor = migrate(saved.tapColor, ['#cacacc', '#f19117', '#d2541e'], ACCENT_COLOR);
    return {
      ...DEFAULTS,
      ...saved,
      bgImages,
      cellColor: cellColor ?? DEFAULTS.cellColor,
      tapColor: tapColor ?? DEFAULTS.tapColor,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);
  // 保存できなかった（容量超過など）。画面には反映されるが次回起動時に復元されない
  const [saveError, setSaveError] = useState(false);

  // 画像は IndexedDB に置く。開けない環境では localStorage に入れたまま運用する
  // （null = 未判定 / false = 使えない / true = 使える）
  const idbRef = useRef<boolean | null>(null);
  // 起動直後に IndexedDB から読み込むまでは、画像の保存処理を走らせない
  const imagesLoadedRef = useRef(false);

  // 起動時：IndexedDB の画像を読み込む。旧来 localStorage にあった画像は移行する
  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = await loadImages();
      if (!alive) return;
      if (stored === null) {
        idbRef.current = false; // フォールバック：localStorage のまま
        imagesLoadedRef.current = true;
        return;
      }
      idbRef.current = true;
      setSettings(prev => {
        if (stored.length > 0) return { ...prev, bgImages: stored };
        // IndexedDB が空で localStorage に画像が残っていれば、それを引き継ぐ（移行）。
        // 新しいオブジェクトを返して保存処理を走らせ、localStorage 側の画像を消す
        if (prev.bgImages.length > 0) void saveImages(prev.bgImages);
        return { ...prev };
      });
      imagesLoadedRef.current = true;
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const useIdb = idbRef.current === true;
    // 画像以外は localStorage（IndexedDB が使えるときは画像を除いて軽く保つ）
    const { bgImages, ...rest } = settings;
    try {
      localStorage.setItem(KEY, JSON.stringify(useIdb ? rest : settings));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
    if (useIdb && imagesLoadedRef.current) {
      void saveImages(bgImages).then(ok => {
        if (!ok) setSaveError(true);
      });
    }
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  return { settings, update, saveError };
}

// 背景画像は localStorage (約5MB) に収まるよう縮小して data URL 化する
export async function imageFileToDataUrl(file: File): Promise<string> {
  const rawUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('image load failed'));
    img.src = rawUrl;
  });

  // 複数枚を localStorage に収めるため、1枚あたりのサイズを抑える
  const max = 1200;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.75);
}
