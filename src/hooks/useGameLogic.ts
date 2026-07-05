import { useState, useCallback } from 'react';
import type { GameState, GameMode, GridConfig } from '../types/game';
import { generateGrid } from '../utils/gridGenerator';
import { isBlinkOn } from '../utils/blink';

const INITIAL_CONFIG: GridConfig = { cols: 4, rows: 4 };

const CELL_PT = 10;
const BONUS_PT = 50;
const CLEAR_PT = 100;

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

// time モードは goal と同じ盤面（S→G、地雷・加点あり）で遊ぶ
function genFor(mode: GameMode, config: GridConfig, stage: number) {
  return generateGrid(config, mode === 'fill' ? 'fill' : 'goal', stage);
}

function makeInitialState(mode: GameMode): GameState {
  const { cells, startPos, goalPos } = genFor(mode, INITIAL_CONFIG, 0);
  return {
    mode,
    cells,
    startPos,
    goalPos,
    path: [],
    bonusHits: 0,
    totalScore: 0,
    lastRoundScore: 0,
    goalCount: 0,
    isTracing: false,
    isGoal: false,
    config: INITIAL_CONFIG,
    roundId: 0,
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(() => makeInitialState('fill'));

  const newGame = useCallback((mode: GameMode) => {
    setState(prev => ({ ...makeInitialState(mode), roundId: prev.roundId + 1 }));
  }, []);

  const beginTrace = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.isGoal) return prev;
      if (prev.cells[row]?.[col]?.type !== 'start') return prev;

      const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
      cells[row][col] = { ...cells[row][col], visited: true };
      return { ...prev, cells, path: [[row, col]], bonusHits: 0, isTracing: true };
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

      // 地雷 → チャレンジ失敗（トレースをリセット）
      // ただし点滅地雷は消えている間なら通過できる
      if (cell.type === 'mine' && (!cell.blink || isBlinkOn())) {
        const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
        return { ...prev, cells, path: [], bonusHits: 0, isTracing: false };
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
      const finished =
        prev.mode === 'fill' ? path.length === totalCells : cell.type === 'goal';

      if (finished) {
        const score = path.length * CELL_PT + bonusHits * BONUS_PT + CLEAR_PT;
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
        };
      }

      return { ...prev, cells, path, bonusHits };
    });
  }, []);

  const resetTrace = useCallback(() => {
    setState(prev => {
      if (!prev.isTracing) return prev;
      const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
      return { ...prev, cells, path: [], bonusHits: 0, isTracing: false };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(prev => {
      const config = computeConfig(prev.goalCount);
      const { cells, startPos, goalPos } = genFor(prev.mode, config, prev.goalCount);
      return {
        ...prev,
        config,
        cells,
        startPos,
        goalPos,
        path: [],
        bonusHits: 0,
        isTracing: false,
        isGoal: false,
        roundId: prev.roundId + 1,
      };
    });
  }, []);

  return {
    ...state,
    roundScore: state.path.length * CELL_PT + state.bonusHits * BONUS_PT,
    newGame,
    beginTrace,
    extendTrace,
    resetTrace,
    nextRound,
  };
}
