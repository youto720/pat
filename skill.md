# pat — 開発スキル・ノート

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後の確認）
npm run preview

# Vercel デプロイ（要: npm i -g vercel）
vercel deploy --prod
```

## アーキテクチャ

```
App.tsx
 ├── useGameLogic()    ← ゲーム状態の単一ソース（GameState）
 ├── useSound()        ← Web Audio API（副作用のみ、状態なし）
 ├── <GameHeader>      ← スコア・タイトル・メニュー
 ├── <Grid>            ← グリッド描画＋タッチ/マウス操作
 └── <GoalEffect>      ← ゴール時エフェクト（isGoalがtrueの間のみ）
```

## 状態管理方針

- ゲーム状態は `useGameLogic` の `GameState` オブジェクトに一元管理
- `setState(prev => ...)` の関数型更新を必ず使う（非同期バッチに安全）
- タッチイベントは `passive: false` で attach し、スクロールを防ぐ
- `handlersRef` パターンで最新のハンドラを安定した event listener から参照

## レベルアップロジック

- ゴール3回ごと: cols +1（最大8）
- ゴール5回ごと: rows +1（最大12）
- `computeConfig(goalCount)` が常に INITIAL_CONFIG からの差分で計算

## 音の仕組み（Web Audio API）

- `useSound.ts` はモジュールレベルの `AudioContext` を1つ使い回す
- `playStep(step)`: 基音440Hz × 1.04^step（最大24ステップ）
- `playGoal()`: C5/E5/G5 を 0.18s 間隔でファンファーレ
- `playReset()`: sawtooth波 180→60Hz フェードアウト

## グリッドサイズ計算

```
width = min(100vw - 80px, (100dvh - 120px) * cols/rows)
aspect-ratio = cols / rows
```

各セルは CSS grid の `1fr` で自動計算されるため JS でサイズ計算不要。

## タッチ操作の落とし穴

- `touchmove` は `touchstart` したターゲットでしか発火しないので、
  `document.elementFromPoint(touch.clientX, touch.clientY)` で現在のセルを取得する
- `data-row` / `data-col` 属性でセルを識別
- `passive: false` は `useEffect` で addEventListener 直接追加（React の合成イベントは passive）
