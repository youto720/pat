import { useEffect, useRef, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { Grid } from './components/Grid';
import { GoalEffect } from './components/GoalEffect';
import { DebugPanel } from './components/DebugPanel';
import { StartGate } from './components/StartGate';
import { Menu } from './components/Menu';
import { Ranking } from './components/Ranking';
import { ContactForm } from './components/ContactForm';
import { HowToPlay } from './components/HowToPlay';
import { TimeAttackStart, TimeAttackResult } from './components/TimeAttack';
import type { TaRule } from './components/TimeAttack';
import { AdBanner, AdInterstitial } from './components/Ad';
import { useGameLogic, computeConfig } from './hooks/useGameLogic';
import { useSound } from './hooks/useSound';
import { useSettings } from './stores/settings';
import { useIsPro } from './stores/plan';
import { randomPalette } from './utils/palette';
import { saveRank, getUserName } from './stores/ranking';
import type { GameMode, Palette } from './types/game';

export default function App() {
  const game = useGameLogic();
  const sound = useSound();
  const { settings, update, saveError } = useSettings();
  const isPro = useIsPro();
  const [started, setStarted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [randomPal, setRandomPal] = useState<Palette>(() => randomPalette());

  // タイムアタック（duration は秒単位）
  const [taDuration, setTaDuration] = useState(30);
  const [taMode, setTaMode] = useState<TaRule>('fill');
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

  // 背景画像：PRO で複数枚あるときはラウンドごとにランダムで1枚選ぶ
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const n = settings.bgImages.length;
    if (!isPro || n <= 1) {
      setBgIndex(0);
      return;
    }
    // 直前と同じ画像が続かないように選ぶ
    setBgIndex(prev => {
      let next = Math.floor(Math.random() * n);
      if (next === prev && n > 1) next = (next + 1) % n;
      return next;
    });
  }, [game.roundId, settings.bgImages.length, isPro]);

  const bgImage = settings.bgImages[Math.min(bgIndex, settings.bgImages.length - 1)] ?? null;

  // GOAL 演出が消えてから次ラウンドへ（グリッド拡大もこのタイミングで反映）
  // 10ステージクリアごとに全画面広告（タイムアタック中と PRO では出さない）
  useEffect(() => {
    if (!game.isGoal) return;
    const t = setTimeout(() => {
      game.nextRound();
      if (!isPro && game.goalCount > 0 && game.goalCount % 10 === 0 && taEndTs == null) {
        setShowAd(true);
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [game.isGoal, game.goalCount, isPro]);

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
    game.newGame(mode, taMode);
    setTaEndTs(null);
    setTaTimeLeft(null);
    setTaResult(null);
    setMenuOpen(false);
  };

  const startTimeAttack = () => {
    game.newGame('time', taMode);
    setTaResult(null);
    setTaEndTs(Date.now() + taDuration * 1000);
    setTaTimeLeft(taDuration * 1000);
  };

  // スタート画面でルールを切り替えたら、背後の盤面も引き直す
  const changeTaMode = (m: TaRule) => {
    setTaMode(m);
    game.newGame('time', m);
  };

  const taRunning = taEndTs != null;
  const gridDisabled = game.mode === 'time' && !taRunning;

  const next = computeConfig(game.goalCount);
  const willGrow = next.cols !== game.config.cols || next.rows !== game.config.rows;

  // 背景画像は画面全体には出さない。グリッドのマスをめくると初めて見えるよう、
  // Grid 側でマスの裏面にだけ描画する
  const bgStyle: React.CSSProperties = { backgroundColor: palette.bg };

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
        bgImage={bgImage}
        disabled={gridDisabled}
      />

      {/* 画面下の固定広告枠 */}
      {!isPro && <AdBanner />}

      {game.isGoal && (
        <GoalEffect
          score={game.lastRoundScore}
          willGrow={willGrow}
          perfect={game.isPerfect}
          fillRule={game.effectiveMode === 'fill'}
        />
      )}

      {started && game.mode === 'time' && !taRunning && !taResult && (
        <TimeAttackStart
          duration={taDuration}
          onChangeDuration={setTaDuration}
          mode={taMode}
          onChangeMode={changeTaMode}
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
          onShowContact={() => {
            setShowContact(true);
            setMenuOpen(false);
          }}
          onShowHowTo={() => {
            setShowHowTo(true);
            setMenuOpen(false);
          }}
          onClose={() => setMenuOpen(false)}
          saveError={saveError}
        />
      )}

      {showRank && <Ranking onClose={() => setShowRank(false)} />}

      {showContact && <ContactForm onClose={() => setShowContact(false)} />}

      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}

      {showAd && <AdInterstitial onClose={() => setShowAd(false)} />}

      {!started && <StartGate onStart={() => setStarted(true)} />}

      {showDebug && <DebugPanel sound={sound} onClose={() => setShowDebug(false)} />}
    </div>
  );
}
