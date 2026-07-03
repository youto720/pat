// タイムアタックのローカルランキング。
// 本番のオンラインランキング（自動採番ユーザー・ログイン登録）はサーバーが
// 必要なため、同じデータ形式のまま localStorage に保存しておく。

export interface RankEntry {
  name: string;
  score: number;
  stages: number;
  duration: number; // minutes
  ts: number;
}

export type RankPeriod = 'today' | 'week' | 'lastMonth';

const RANK_KEY = 'popo_ranks';
const USER_KEY = 'popo_user';

// 端末ごとに自動採番されるユーザー名（例: P-7KQ2）
export function getUserName(): string {
  let name = localStorage.getItem(USER_KEY);
  if (!name) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    name =
      'P-' +
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    localStorage.setItem(USER_KEY, name);
  }
  return name;
}

function loadAll(): RankEntry[] {
  try {
    const raw = localStorage.getItem(RANK_KEY);
    return raw ? (JSON.parse(raw) as RankEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveRank(entry: RankEntry) {
  const all = loadAll();
  all.push(entry);
  // 古いものから捨てて肥大化を防ぐ
  while (all.length > 500) all.shift();
  try {
    localStorage.setItem(RANK_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function periodRange(period: RankPeriod): [number, number] {
  const now = new Date();
  if (period === 'today') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [from.getTime(), Infinity];
  }
  if (period === 'week') {
    // 月曜はじまりの今週
    const day = (now.getDay() + 6) % 7;
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    return [from.getTime(), Infinity];
  }
  // 先月（前のカレンダー月）
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 1);
  return [from.getTime(), to.getTime()];
}

export function getRanks(period: RankPeriod, limit = 20): RankEntry[] {
  const [from, to] = periodRange(period);
  return loadAll()
    .filter(e => e.ts >= from && e.ts < to)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
