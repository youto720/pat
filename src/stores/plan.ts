import { useCallback, useSyncExternalStore } from 'react';

// 無料 / 有料（PRO）の判定をここに集約する。
// 本番では課金・ログイン状態から決まるが、現時点では開発用トグルで切り替える。
// 有料機能を実装するときは isPro を参照すること。

const KEY = 'po_plan_pro';

// 有料機能の検証用トグル。デプロイ先でも動作確認したいので本番ビルドでも出す。
// 課金/ログインと接続したら false にして、このトグルを取り除くこと。
export const DEV_PLAN_TOGGLE = true;

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setPro(pro: boolean) {
  try {
    localStorage.setItem(KEY, pro ? '1' : '0');
  } catch {
    // 保存できなくても画面には反映する
  }
  listeners.forEach(cb => cb());
}

/** 現在のプランが PRO かどうか（コンポーネント内で使う） */
export function useIsPro(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** PRO の切り替え（開発用） */
export function useTogglePro(): () => void {
  const isPro = useIsPro();
  return useCallback(() => setPro(!isPro), [isPro]);
}

/** コンポーネント外から判定したいとき用 */
export function isProNow(): boolean {
  return read();
}
