// 背景画像の保存先（IndexedDB）。
// localStorage（約5MB）では複数枚の画像が入りきらないため、画像だけここに置く。
// 端末内のブラウザ内蔵ストレージであり、外部サーバーは使わない。
// IndexedDB が使えない環境では null を返し、呼び出し側が localStorage にフォールバックする。

const DB_NAME = 'po';
const STORE = 'images';
const KEY = 'bgImages';

function openDb(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** 保存済みの画像一覧。IndexedDB が使えないときは null（未保存とは区別する） */
export async function loadImages(): Promise<string[] | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => {
        const v = req.result;
        resolve(Array.isArray(v) ? (v as string[]) : []);
      };
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
    } catch {
      resolve(null);
    }
  });
}

/** 画像一覧を丸ごと保存。成功したら true */
export async function saveImages(images: string[]): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(images, KEY);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
