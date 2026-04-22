export type CellType = 'normal' | 'start' | 'goal';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  visited: boolean;
}

export interface GridConfig {
  cols: number;
  rows: number;
}

export interface GameState {
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
  path: Array<[number, number]>;
  totalScore: number;
  lastRoundScore: number;
  goalCount: number;
  isTracing: boolean;
  isGoal: boolean;
  config: GridConfig;
}
