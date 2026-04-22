import { useState, useCallback } from 'react';
import type { GameState, GridConfig } from '../types/game';
import { generateGrid } from '../utils/gridGenerator';

const INITIAL_CONFIG: GridConfig = { cols: 5, rows: 7 };
const MAX_COLS = 8;
const MAX_ROWS = 12;

function computeConfig(goalCount: number): GridConfig {
  const colBonus = Math.min(
    Math.floor(goalCount / 3),
    MAX_COLS - INITIAL_CONFIG.cols
  );
  const rowBonus = Math.min(
    Math.floor(goalCount / 5),
    MAX_ROWS - INITIAL_CONFIG.rows
  );
  return {
    cols: INITIAL_CONFIG.cols + colBonus,
    rows: INITIAL_CONFIG.rows + rowBonus,
  };
}

function makeInitialState(): GameState {
  const { cells, startPos, goalPos } = generateGrid(INITIAL_CONFIG);
  return {
    cells,
    startPos,
    goalPos,
    path: [],
    totalScore: 0,
    lastRoundScore: 0,
    goalCount: 0,
    isTracing: false,
    isGoal: false,
    config: INITIAL_CONFIG,
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(makeInitialState);

  const beginTrace = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.isGoal) return prev;
      if (prev.cells[row]?.[col]?.type !== 'start') return prev;

      const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
      cells[row][col] = { ...cells[row][col], visited: true };
      return { ...prev, cells, path: [[row, col]], isTracing: true };
    });
  }, []);

  const extendTrace = useCallback((row: number, col: number) => {
    setState(prev => {
      if (!prev.isTracing || prev.isGoal || prev.path.length === 0) return prev;

      const [lastRow, lastCol] = prev.path[prev.path.length - 1];
      const dr = Math.abs(row - lastRow);
      const dc = Math.abs(col - lastCol);
      if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return prev;

      if (!prev.cells[row]?.[col]) return prev;
      if (prev.cells[row][col].visited) return prev;

      const cells = prev.cells.map(r => r.map(c => ({ ...c })));
      cells[row][col] = { ...cells[row][col], visited: true };
      const path: Array<[number, number]> = [...prev.path, [row, col]];

      if (prev.cells[row][col].type === 'goal') {
        const score = path.length * 10;
        const newGoalCount = prev.goalCount + 1;
        const newConfig = computeConfig(newGoalCount);
        return {
          ...prev,
          cells,
          path,
          totalScore: prev.totalScore + score,
          lastRoundScore: score,
          goalCount: newGoalCount,
          isTracing: false,
          isGoal: true,
          config: newConfig,
        };
      }

      return { ...prev, cells, path };
    });
  }, []);

  const resetTrace = useCallback(() => {
    setState(prev => {
      if (!prev.isTracing) return prev;
      const cells = prev.cells.map(r => r.map(c => ({ ...c, visited: false })));
      return { ...prev, cells, path: [], isTracing: false };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(prev => {
      const { cells, startPos, goalPos } = generateGrid(prev.config);
      return {
        ...prev,
        cells,
        startPos,
        goalPos,
        path: [],
        isTracing: false,
        isGoal: false,
      };
    });
  }, []);

  return {
    ...state,
    roundScore: state.path.length * 10,
    beginTrace,
    extendTrace,
    resetTrace,
    nextRound,
  };
}
