import { useState, useCallback } from 'react';
import type { GameState, GameMode, GridConfig } from '../types/game';
import { generateGrid } from '../utils/gridGenerator';

const INITIAL_CONFIG: GridConfig = { cols: 4, rows: 4 };
const MAX_COLS = 8;
const MAX_ROWS = 8;

const CELL_PT = 10;
const BONUS_PT = 50;
const CLEAR_PT = 100;

export function computeConfig(goalCount: number): GridConfig {
  const bonus = Math.floor(goalCount / 2);
  return {
    cols: Math.min(INITIAL_CONFIG.cols + bonus, MAX_COLS),
    rows: Math.min(INITIAL_CONFIG.rows + bonus, MAX_ROWS),
  };
}

// time モードは fill と同じ盤面（全マス埋め）で遊ぶ
function genFor(mode: GameMode, config: GridConfig, stage: number) {
  return generateGrid(config, mode === 'goal' ? 'goal' : 'fill', stage);
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
      if (cell.type === 'mine') {
        const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
        return { ...prev, cells, path: [], bonusHits: 0, isTracing: false };
      }

      const cells = prev.cells.map(r => r.map(c => ({ ...c })));
      cells[row][col] = { ...cells[row][col], visited: true };
      const path: Array<[number, number]> = [...prev.path, [row, col]];
      const bonusHits = prev.bonusHits + (cell.type === 'bonus' ? 1 : 0);

      const totalCells = prev.config.rows * prev.config.cols;
      const finished =
        prev.mode === 'goal' ? cell.type === 'goal' : path.length === totalCells;

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
