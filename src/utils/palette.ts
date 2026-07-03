import type { Palette } from '../types/game';

// ランダムだが「薄いマス色 × 濃いタップ色 × ごく薄い背景」の関係は常に保つ
export function randomPalette(): Palette {
  const h = Math.floor(Math.random() * 360);
  const h2 = (h + 60 + Math.floor(Math.random() * 240)) % 360;
  return {
    bg: `hsl(${h}, 45%, 96%)`,
    cell: `hsl(${h}, 75%, 82%)`,
    tap: `hsl(${h2}, 70%, 55%)`,
  };
}
