export type CellType = 'normal' | 'start' | 'goal' | 'mine' | 'bonus';

export type GameMode = 'fill' | 'goal' | 'time';

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

export interface Palette {
  bg: string;
  cell: string;
  tap: string;
}

export interface GameState {
  mode: GameMode;
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
  path: Array<[number, number]>;
  bonusHits: number;
  totalScore: number;
  lastRoundScore: number;
  goalCount: number;
  isTracing: boolean;
  isGoal: boolean;
  config: GridConfig;
  roundId: number;
}
