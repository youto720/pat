import { useState, useCallback } from 'react';
import type { GameState, GameMode, GridConfig, SoundKind, TimeVariant } from '../types/game';
import { generateGrid } from '../utils/gridGenerator';
import { isBlinkOn } from '../utils/blink';

const INITIAL_CONFIG: GridConfig = { cols: 4, rows: 4 };
const ENDLESS_CONFIG: GridConfig = { cols: 6, rows: 6 };

const CELL_PT = 10;
const BONUS_PT = 50;
const CLEAR_PT = 100;
const PERFECT_PT = 300; // goal/time モードで全マス埋めてクリアした時の追加ボーナス

export function computeConfig(goalCount: number): GridConfig {
  // スマホは 8x8 上限、タブレット以上（768px〜）は 12x12 まで
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768;
  const max = isTablet ? 12 : 8;
  const bonus = Math.floor(goalCount / 2);
  return {
    cols: Math.min(INITIAL_CONFIG.cols + bonus, max),
    rows: Math.min(INITIAL_CONFIG.rows + bonus, max),
  };
}

// time モードは timeVariant（fill / goal / endless）のルールで遊ぶ
function effectiveMode(mode: GameMode, timeVariant: TimeVariant): 'fill' | 'goal' | 'endless' {
  return mode === 'time' ? timeVariant : mode;
}

// endless は fill と同じ「全マス埋め」の盤面を使う
function boardKind(effMode: 'fill' | 'goal' | 'endless'): 'fill' | 'goal' {
  return effMode === 'goal' ? 'goal' : 'fill';
}

function genFor(
  mode: GameMode,
  timeVariant: TimeVariant,
  config: GridConfig,
  stage: number,
  forcedStart?: [number, number]
) {
  const effMode = effectiveMode(mode, timeVariant);
  return generateGrid(config, boardKind(effMode), stage, forcedStart);
}

// ラウンド開始時の盤面（pristine）からの復元用ディープコピー
function cloneCells(cells: GameState['pristineCells']): GameState['cells'] {
  return cells.map(row => row.map(c => ({ ...c, visited: false })));
}

// 効果音イベントを発行（id はゲームをまたいで単調増加）
function soundOf(prev: GameState, kind: SoundKind, step?: number) {
  return { id: (prev.soundEvent?.id ?? 0) + 1, kind, step };
}

function makeInitialState(mode: GameMode, timeVariant: TimeVariant): GameState {
  // ENDLESS は途中で拡大できない（指を離さず続けるため）ので最初から 6x6
  const config =
    effectiveMode(mode, timeVariant) === 'endless' ? ENDLESS_CONFIG : INITIAL_CONFIG;
  const { cells, startPos, goalPos } = genFor(mode, timeVariant, config, 0);
  return {
    mode,
    timeVariant,
    cells,
    pristineCells: cloneCells(cells),
    startPos,
    goalPos,
    path: [],
    bonusHits: 0,
    totalScore: 0,
    lastRoundScore: 0,
    goalCount: 0,
    isTracing: false,
    isGoal: false,
    isPerfect: false,
    config,
    roundId: 0,
    soundEvent: null,
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(() => makeInitialState('fill', 'goal'));

  const newGame = useCallback((mode: GameMode, timeVariant: TimeVariant = 'goal') => {
    setState(prev => ({
      ...makeInitialState(mode, timeVariant),
      roundId: prev.roundId + 1,
      // id の単調増加を保つため直前のイベントを引き継ぐ（再生はされない）
      soundEvent: prev.soundEvent,
    }));
  }, []);

  const beginTrace = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.isGoal) return prev;
      if (prev.cells[row]?.[col]?.type !== 'start') return prev;

      // 前回の失敗で消えた地雷なども含め、ラウンド開始時の盤面から再開
      const cells = cloneCells(prev.pristineCells);
      cells[row][col] = { ...cells[row][col], visited: true };
      return {
        ...prev,
        cells,
        path: [[row, col]],
        bonusHits: 0,
        isTracing: true,
        soundEvent: soundOf(prev, 'step', 0),
      };
    });
  }, []);

  const extendTrace = useCallback((row: number, col: number) => {
    setState(prev => {
      if (!prev.isTracing || prev.isGoal || prev.path.length === 0) return prev;

      const [lastRow, lastCol] = prev.path[prev.path.length - 1];
      const dr = Math.abs(row - lastRow);
      const dc = Math.abs(col - lastCol);
      if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return prev;

      const cell = prev.cells[row]?.[col];
      if (!cell || cell.visited) return prev;

      // 地雷 → チャレンジ失敗（盤面をラウンド開始時の状態に復元）
      // ただし点滅地雷は消えている間なら通過できる
      if (cell.type === 'mine' && (!cell.blink || isBlinkOn())) {
        return {
          ...prev,
          cells: cloneCells(prev.pristineCells),
          path: [],
          bonusHits: 0,
          isTracing: false,
          soundEvent: soundOf(prev, 'fail'),
        };
      }

      const cells = prev.cells.map(r => r.map(c => ({ ...c })));
      cells[row][col] = { ...cells[row][col], visited: true };
      const path: Array<[number, number]> = [...prev.path, [row, col]];
      const bonusHits = prev.bonusHits + (cell.type === 'bonus' ? 1 : 0);

      // 加点マスを取ったら、残っている地雷を1つ消す
      if (cell.type === 'bonus') {
        const mines: Array<[number, number]> = [];
        cells.forEach(r =>
          r.forEach(c2 => {
            if (c2.type === 'mine' && !c2.visited) mines.push([c2.row, c2.col]);
          })
        );
        if (mines.length > 0) {
          const [mr, mc] = mines[Math.floor(Math.random() * mines.length)];
          cells[mr][mc] = { ...cells[mr][mc], type: 'normal', blink: undefined };
        }
      }

      const totalCells = prev.config.rows * prev.config.cols;
      const effMode = effectiveMode(prev.mode, prev.timeVariant);
      const finished =
        effMode === 'goal' ? cell.type === 'goal' : path.length === totalCells;

      // ENDLESS: 演出を挟まず、埋め終わった位置をそのまま次の盤面のスタートにして続行
      if (finished && effMode === 'endless') {
        const score = path.length * CELL_PT + CLEAR_PT;
        const next = genFor(prev.mode, prev.timeVariant, prev.config, prev.goalCount + 1, [
          row,
          col,
        ]);
        const nextCells = next.cells.map(r => r.map(c => ({ ...c })));
        nextCells[row][col] = { ...nextCells[row][col], visited: true };
        return {
          ...prev,
          cells: nextCells,
          pristineCells: cloneCells(next.cells),
          startPos: next.startPos,
          goalPos: next.goalPos,
          path: [[row, col]],
          bonusHits: 0,
          totalScore: prev.totalScore + score,
          lastRoundScore: score,
          goalCount: prev.goalCount + 1,
          isTracing: true, // 指は離さないのでトレース継続
          roundId: prev.roundId + 1,
          soundEvent: soundOf(prev, 'goal'),
        };
      }

      if (finished) {
        // goal ルールで全マス埋めてゴールしたら PERFECT
        const isPerfect = effMode !== 'fill' && path.length === totalCells;
        const score =
          path.length * CELL_PT +
          bonusHits * BONUS_PT +
          CLEAR_PT +
          (isPerfect ? PERFECT_PT : 0);
        // config はここでは増やさない（GOAL 演出が消えた後 nextRound で反映）
        return {
          ...prev,
          cells,
          path,
          bonusHits,
          totalScore: prev.totalScore + score,
          lastRoundScore: score,
          goalCount: prev.goalCount + 1,
          isTracing: false,
          isGoal: true,
          isPerfect,
          soundEvent: soundOf(prev, isPerfect ? 'perfect' : 'goal'),
        };
      }

      return {
        ...prev,
        cells,
        path,
        bonusHits,
        soundEvent: soundOf(
          prev,
          cell.type === 'bonus' ? 'bonus' : 'step',
          path.length - 1
        ),
      };
    });
  }, []);

  const resetTrace = useCallback(() => {
    setState(prev => {
      if (!prev.isTracing) return prev;
      // 加点で消した地雷なども含め、ラウンド開始時の盤面に復元
      return {
        ...prev,
        cells: cloneCells(prev.pristineCells),
        path: [],
        bonusHits: 0,
        isTracing: false,
        soundEvent: soundOf(prev, 'reset'),
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(prev => {
      const config = computeConfig(prev.goalCount);
      const { cells, startPos, goalPos } = genFor(prev.mode, prev.timeVariant, config, prev.goalCount);
      return {
        ...prev,
        config,
        cells,
        pristineCells: cloneCells(cells),
        startPos,
        goalPos,
        path: [],
        bonusHits: 0,
        isTracing: false,
        isGoal: false,
        isPerfect: false,
        roundId: prev.roundId + 1,
      };
    });
  }, []);

  return {
    ...state,
    // time モード時は timeVariant を反映した実効ルール
    effectiveMode: effectiveMode(state.mode, state.timeVariant),
    roundScore: state.path.length * CELL_PT + state.bonusHits * BONUS_PT,
    newGame,
    beginTrace,
    extendTrace,
    resetTrace,
    nextRound,
  };
}
