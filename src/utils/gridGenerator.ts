import type { Cell, CellType, GridConfig } from '../types/game';

function manhattan(a: [number, number], b: [number, number]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function randomCell(rows: number, cols: number): [number, number] {
  return [
    Math.floor(Math.random() * rows),
    Math.floor(Math.random() * cols),
  ];
}

export function generateGrid(config: GridConfig): {
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
} {
  const { rows, cols } = config;
  const minDist = Math.max(4, Math.floor((rows + cols) / 2.5));

  let start: [number, number];
  let goal: [number, number];
  let attempts = 0;

  do {
    start = randomCell(rows, cols);
    goal = randomCell(rows, cols);
    attempts++;
    if (attempts > 200) {
      // Fallback: place start at top-left, goal at bottom-right area
      start = [0, 0];
      goal = [rows - 1, cols - 1];
      break;
    }
  } while (manhattan(start, goal) < minDist);

  const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      let type: CellType = 'normal';
      if (r === start[0] && c === start[1]) type = 'start';
      else if (r === goal[0] && c === goal[1]) type = 'goal';
      return { row: r, col: c, type, visited: false };
    })
  );

  return { cells, startPos: start, goalPos: goal };
}
