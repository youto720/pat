import { useState, useCallback, useEffect } from 'react';

export interface Settings {
  bgColor: string;
  cellColor: string;
  tapColor: string;
  randomColors: boolean;
  bgImages: string[]; // data URL の配列（PRO は複数枚もてる）
}

const KEY = 'popo_settings';

// 無料は1枚だけ、PRO は複数枚を登録してラウンドごとにランダム表示
export const MAX_BG_IMAGES_FREE = 1;
export const MAX_BG_IMAGES_PRO = 8;

// アプリのメインカラー。ボタンなどの UI アクセントはすべてここを参照する
export const MAIN_COLOR = '#38a7d0';
export const MAIN_COLOR_RGB = '56, 167, 208'; // 影などで rgba() を作る用

export const DEFAULT_COLORS = {
  bgColor: '#ffffff',
  cellColor: MAIN_COLOR,
  tapColor: '#d2541e',
};

const DEFAULTS: Settings = {
  ...DEFAULT_COLORS,
  randomColors: true,
  bgImages: [],
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<Settings> & { bgImage?: string | null };
    // 旧形式（bgImage 単体）からの移行
    const bgImages = saved.bgImages ?? (saved.bgImage ? [saved.bgImage] : []);
    return { ...DEFAULTS, ...saved, bgImages };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);
  // localStorage の容量超過（画像の入れすぎ）で保存できなかったか
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
      setSaveError(false);
    } catch {
      // 画面には反映されるが、次回起動時には復元されない
      setSaveError(true);
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
