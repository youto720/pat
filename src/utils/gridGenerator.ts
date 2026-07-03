import type { Cell, CellType, GridConfig } from '../types/game';

interface Generated {
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
}

function buildCells(
  rows: number,
  cols: number,
  typeAt: (r: number, c: number) => CellType
): Cell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      type: typeAt(r, c),
      visited: false,
    }))
  );
}

function randPos(rows: number, cols: number): [number, number] {
  return [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
}

// ─── FILL モード：全マス埋め ──────────────────────────────────────────
function generateFillGrid(config: GridConfig): Generated {
  const { rows, cols } = config;
  const isOdd = (rows * cols) % 2 === 1;

  // 奇数マスの時はハミルトン路が存在する「多数派の色」(r+c が偶数) からのみスタート
  let start: [number, number];
  do {
    start = randPos(rows, cols);
  } while (isOdd && (start[0] + start[1]) % 2 !== 0);

  const cells = buildCells(rows, cols, (r, c) =>
    r === start[0] && c === start[1] ? 'start' : 'normal'
  );
  return { cells, startPos: start, goalPos: start };
}

// ─── GOAL モード：S→G。ステージが進むと地雷・加点マスが出現 ─────────────
function pathExists(
  rows: number,
  cols: number,
  start: [number, number],
  goal: [number, number],
  blocked: Set<string>
): boolean {
  const queue: Array<[number, number]> = [start];
  const seen = new Set<string>([`${start[0]},${start[1]}`]);
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === goal[0] && c === goal[1]) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (seen.has(key) || blocked.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc]);
    }
  }
  return false;
}

function generateGoalGrid(config: GridConfig, stage: number): Generated {
  const { rows, cols } = config;
  const total = rows * cols;

  // stage は 0 始まり。第1ステージ (stage=0) は地雷・加点なし
  const mineCount =
    stage < 1 ? 0 : Math.min(1 + Math.floor((stage - 1) / 2), Math.floor(total * 0.12));
  const bonusCount = stage < 1 ? 0 : Math.min(1 + Math.floor((stage - 1) / 3), 3);

  for (let attempt = 0; attempt < 80; attempt++) {
    const start = randPos(rows, cols);
    const goal = randPos(rows, cols);
    const dist = Math.abs(start[0] - goal[0]) + Math.abs(start[1] - goal[1]);
    if (dist < Math.max(rows, cols)) continue;

    // S/G 以外からランダムに地雷・加点マスを選ぶ
    const others: Array<[number, number]> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) continue;
        others.push([r, c]);
      }
    }
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const mines = others.slice(0, mineCount);
    const bonuses = others.slice(mineCount, mineCount + bonusCount);

    // 地雷を避けて S→G に到達できることを保証
    const blocked = new Set(mines.map(([r, c]) => `${r},${c}`));
    if (!pathExists(rows, cols, start, goal, blocked)) continue;

    const typeMap = new Map<string, CellType>();
    typeMap.set(`${start[0]},${start[1]}`, 'start');
    typeMap.set(`${goal[0]},${goal[1]}`, 'goal');
    mines.forEach(([r, c]) => typeMap.set(`${r},${c}`, 'mine'));
    bonuses.forEach(([r, c]) => typeMap.set(`${r},${c}`, 'bonus'));

    const cells = buildCells(rows, cols, (r, c) => typeMap.get(`${r},${c}`) ?? 'normal');
    return { cells, startPos: start, goalPos: goal };
  }

  // フォールバック：地雷なしで確実に生成
  const start: [number, number] = [0, 0];
  const goal: [number, number] = [rows - 1, cols - 1];
  const cells = buildCells(rows, cols, (r, c) => {
    if (r === start[0] && c === start[1]) return 'start';
    if (r === goal[0] && c === goal[1]) return 'goal';
    return 'normal';
  });
  return { cells, startPos: start, goalPos: goal };
}

export function generateGrid(
  config: GridConfig,
  mode: 'fill' | 'goal',
  stage: number
): Generated {
  return mode === 'goal' ? generateGoalGrid(config, stage) : generateFillGrid(config);
}
