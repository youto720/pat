export type CellType = 'normal' | 'start' | 'goal' | 'mine' | 'bonus';

export type GameMode = 'fill' | 'goal' | 'time' | 'endless';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  visited: boolean;
  blink?: boolean; // 点滅する地雷（消えている間は通過できる）
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

export type TimeVariant = 'fill' | 'goal' | 'endless';

// ゲームロジックが発行する効果音イベント。
// 状態が実際に変化した時だけ id が増え、表示側は id の変化で1回だけ再生する
export type SoundKind =
  | 'step'
  | 'bonus'
  | 'complete' // FILL / ENDLESS のクリア（なぞり音の続きで少し高い音）
  | 'goal'
  | 'perfect'
  | 'fail'
  | 'reset';

export interface SoundEvent {
  id: number;
  kind: SoundKind;
  step?: number; // step 音の音程インデックス
}

export interface GameState {
  mode: GameMode;
  timeVariant: TimeVariant; // time モードでどちらのルールで遊ぶか
  cells: Cell[][];
  pristineCells: Cell[][]; // ラウンド開始時の盤面（失敗リセットで復元する）
  startPos: [number, number];
  goalPos: [number, number];
  path: Array<[number, number]>;
  bonusHits: number;
  totalScore: number;
  lastRoundScore: number;
  goalCount: number;
  isTracing: boolean;
  isGoal: boolean;
  isPerfect: boolean; // goal/time モードで全マス埋めてクリアした
  config: GridConfig;
  roundId: number;
  soundEvent: SoundEvent | null;
}
