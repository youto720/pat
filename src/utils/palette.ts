import type { Palette } from '../types/game';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// 12 色の色相環（30° 刻み）で考える
const SECTOR = 30;
const SECTORS = 360 / SECTOR;

// RANDOM カラーの決め方:
//  - CELL: 色相・彩度・明度とも完全ランダム（見えないほど白/黒に寄らない範囲）
//  - TAP : 色相環から CELL の色相とその両隣を外した 9 色の中から選ぶ（はっきり別の色になる）
//  - BG  : CELL をパステル化したもの（同じ色相で、彩度を落として明るく）
export function randomPalette(): Palette {
  const cellHue = rand(0, 360);
  const cellSat = rand(50, 95);
  const cellLight = rand(40, 70);

  const cellSector = Math.round(cellHue / SECTOR) % SECTORS;
  // 両隣（±1）を除いた 2..10 セクター先
  const offset = 2 + Math.floor(Math.random() * (SECTORS - 3));
  const tapHue = ((cellSector + offset) * SECTOR + rand(-10, 10) + 360) % 360;

  return {
    bg: `hsl(${cellHue.toFixed(0)}, ${(cellSat * 0.6).toFixed(0)}%, 94%)`,
    cell: `hsl(${cellHue.toFixed(0)}, ${cellSat.toFixed(0)}%, ${cellLight.toFixed(0)}%)`,
    tap: `hsl(${tapHue.toFixed(0)}, ${rand(70, 90).toFixed(0)}%, ${rand(45, 60).toFixed(0)}%)`,
  };
}
