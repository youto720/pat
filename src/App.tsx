import { useEffect, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { Grid } from './components/Grid';
import { GoalEffect } from './components/GoalEffect';
import { DebugPanel } from './components/DebugPanel';
import { StartGate } from './components/StartGate';
import { useGameLogic } from './hooks/useGameLogic';
import { useSound } from './hooks/useSound';

export default function App() {
  const game = useGameLogic();
  const sound = useSound();
  const [started, setStarted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!game.isGoal) return;
    const t = setTimeout(() => game.nextRound(), 3000);
    return () => clearTimeout(t);
  }, [game.isGoal, game.goalCount]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        backgroundColor: '#ffffff',
        fontFamily: 'Nunito, sans-serif',
        overflow: 'hidden',
      }}
    >
      <GameHeader
        totalScore={game.totalScore}
        goalCount={game.goalCount}
        roundScore={game.roundScore}
      />

      <Grid game={game} sound={sound} />

      {game.isGoal && (
        <GoalEffect
          score={game.lastRoundScore}
          goalCount={game.goalCount}
        />
      )}

      {!started && <StartGate onStart={() => setStarted(true)} />}

      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          padding: '10px 14px',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          fontWeight: 700,
          fontSize: '12px',
          fontFamily: 'inherit',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 40,
          cursor: 'pointer',
        }}
      >
        🔊 Debug
      </button>

      {showDebug && (
        <DebugPanel sound={sound} onClose={() => setShowDebug(false)} />
      )}
    </div>
  );
}
