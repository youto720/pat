import { useEffect, useRef, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { Grid } from './components/Grid';
import { GoalEffect } from './components/GoalEffect';
import { DebugPanel } from './components/DebugPanel';
import { StartGate } from './components/StartGate';
import { Menu } from './components/Menu';
import { Ranking } from './components/Ranking';
import { TimeAttackStart, TimeAttackResult } from './components/TimeAttack';
import { useGameLogic, computeConfig } from './hooks/useGameLogic';
import { useSound } from './hooks/useSound';
import { useSettings } from './stores/settings';
import { randomPalette } from './utils/palette';
import { saveRank, getUserName } from './stores/ranking';
import type { GameMode, Palette } from './types/game';

export default function App() {
  const game = useGameLogic();
  const sound = useSound();
  const { settings, update } = useSettings();
  const [started, setStarted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [randomPal, setRandomPal] = useState<Palette>(() => randomPalette());

  // タイムアタック
  const [taDuration, setTaDuration] = useState(1);
  const [taEndTs, setTaEndTs] = useState<number | null>(null);
  const [taTimeLeft, setTaTimeLeft] = useState<number | null>(null);
  const [taResult, setTaResult] = useState<{ score: number; stages: number } | null>(null);

  // タイマー満了時に最新のスコアを参照するための ref
  const gameRef = useRef(game);
  gameRef.current = game;
  const durationRef = useRef(taDuration);
  durationRef.current = taDuration;

  const palette: Palette = settings.randomColors
    ? randomPal
    : { bg: settings.bgColor, cell: settings.cellColor, tap: settings.tapColor };

  // ニューゲーム（ラウンド）ごとにランダムパレットを引き直す
  useEffect(() => {
    if (settings.randomColors) setRandomPal(randomPalette());
  }, [game.roundId, settings.randomColors]);

  // GOAL 演出が消えてから次ラウンドへ（グリッド拡大もこのタイミングで反映）
  useEffect(() => {
    if (!game.isGoal) return;
    const t = setTimeout(() => game.nextRound(), 3000);
    return () => clearTimeout(t);
  }, [game.isGoal, game.goalCount]);

  // タイムアタックのカウントダウン
  useEffect(() => {
    if (taEndTs == null) return;
    const tick = () => {
      const left = taEndTs - Date.now();
      if (left <= 0) {
        setTaTimeLeft(null);
        setTaEndTs(null);
        const g = gameRef.current;
        setTaResult({ score: g.totalScore, stages: g.goalCount });
        saveRank({
          name: getUserName(),
          score: g.totalScore,
          stages: g.goalCount,
          duration: durationRef.current,
          ts: Date.now(),
        });
      } else {
        setTaTimeLeft(left);
      }
    };
    tick();
    const iv = setInterval(tick, 200);
    return () => clearInterval(iv);
  }, [taEndTs]);

  // TIME 選択画面のキャンセルで戻る先（直前の通常モード）
  const prevModeRef = useRef<GameMode>('fill');

  const changeMode = (mode: GameMode) => {
    if (mode !== 'time') prevModeRef.current = mode;
    game.newGame(mode);
    setTaEndTs(null);
    setTaTimeLeft(null);
    setTaResult(null);
    setMenuOpen(false);
  };

  const startTimeAttack = () => {
    game.newGame('time');
    setTaResult(null);
    setTaEndTs(Date.now() + taDuration * 60_000);
    setTaTimeLeft(taDuration * 60_000);
  };

  const taRunning = taEndTs != null;
  const gridDisabled = game.mode === 'time' && !taRunning;

  const next = computeConfig(game.goalCount);
  const willGrow = next.cols !== game.config.cols || next.rows !== game.config.rows;

  const bgStyle: React.CSSProperties = settings.bgImage
    ? {
        backgroundImage: `url(${settings.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: palette.bg };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        fontFamily: 'Nunito, sans-serif',
        overflow: 'hidden',
        ...bgStyle,
      }}
    >
      <GameHeader
        totalScore={game.totalScore}
        roundScore={game.roundScore}
        timeLeftMs={taTimeLeft}
        onMenu={() => setMenuOpen(true)}
      />

      <Grid
        game={game}
        sound={sound}
        palette={palette}
        hasBgImage={!!settings.bgImage}
        disabled={gridDisabled}
      />

      {game.isGoal && <GoalEffect score={game.lastRoundScore} willGrow={willGrow} />}

      {started && game.mode === 'time' && !taRunning && !taResult && (
        <TimeAttackStart
          duration={taDuration}
          onChangeDuration={setTaDuration}
          onStart={startTimeAttack}
          onCancel={() => changeMode(prevModeRef.current)}
        />
      )}

      {taResult && (
        <TimeAttackResult
          score={taResult.score}
          stages={taResult.stages}
          onShowRank={() => setShowRank(true)}
          onClose={() => setTaResult(null)}
        />
      )}

      {menuOpen && (
        <Menu
          mode={game.mode}
          settings={settings}
          onChangeMode={changeMode}
          onUpdateSettings={update}
          onShowRank={() => {
            setShowRank(true);
            setMenuOpen(false);
          }}
          onShowDebug={() => {
            setShowDebug(true);
            setMenuOpen(false);
          }}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {showRank && <Ranking onClose={() => setShowRank(false)} />}

      {!started && <StartGate onStart={() => setStarted(true)} />}

      {showDebug && <DebugPanel sound={sound} onClose={() => setShowDebug(false)} />}
    </div>
  );
}
