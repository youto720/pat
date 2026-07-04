import { useState, useCallback } from 'react';

export interface Settings {
  bgColor: string;
  cellColor: string;
  tapColor: string;
  randomColors: boolean;
  bgImage: string | null; // data URL
  tapReveal: boolean; // 背景画像があるとき、タップ後のマスに画像を表示する
}

const KEY = 'popo_settings';

const DEFAULTS: Settings = {
  bgColor: '#ffffff',
  cellColor: '#66ccff',
  tapColor: '#cacacc',
  randomColors: false,
  bgImage: null,
  tapReveal: true,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // localStorage 容量超過（大きい背景画像など）→ 保存は諦めて画面には反映
      }
      return next;
    });
  }, []);

  return { settings, update };
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

  const max = 1600;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
