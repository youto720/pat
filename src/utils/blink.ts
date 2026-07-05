// 点滅地雷の共有クロック。表示（Grid）と判定（useGameLogic）が
// 同じ式を使うことで、見た目と当たり判定のズレを防ぐ。
export const BLINK_PERIOD_MS = 800;

export function isBlinkOn(): boolean {
  return Math.floor(Date.now() / BLINK_PERIOD_MS) % 2 === 0;
}
