import type { Cell, CellType, GridConfig } from '../types/game';

export function generateGrid(config: GridConfig): {
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
} {
  const { rows, cols } = config;
  const isOdd = (rows * cols) % 2 === 1;

  // 奇数マスの時はハミルトン路が存在する「多数派の色」(r+c が偶数) からのみスタート
  let start: [number, number];
  do {
    start = [
      Math.floor(Math.random() * rows),
      Math.floor(Math.random() * cols),
    ];
  } while (isOdd && (start[0] + start[1]) % 2 !== 0);

  const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const type: CellType = (r === start[0] && c === start[1]) ? 'start' : 'normal';
      return { row: r, col: c, type, visited: false };
    })
  );

  // goalPos は使わないが型互換のためダミー（start と同じ位置）を返す
  return { cells, startPos: start, goalPos: start };
}
