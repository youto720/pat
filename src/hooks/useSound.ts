declare global {
  interface Window { webkitAudioContext?: typeof AudioContext; }
}

// ─── State & logging ──────────────────────────────────────────────────
let ctx: AudioContext | null = null;
let webAudioOk = false;
let lastError = '';

const logs: string[] = [];
function log(msg: string) {
  const t = new Date().toISOString().slice(11, 23);
  logs.push(`${t} ${msg}`);
  if (logs.length > 80) logs.shift();
}
export function getAudioLogs(): string[] { return logs.slice(); }
export function clearAudioLogs() { logs.length = 0; }

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? window.webkitAudioContext!;
    ctx = new AC();
    log(`ctx created state=${ctx.state}`);
  }
  return ctx;
}

// ─── Unlock ───────────────────────────────────────────────────────────
// Must be called from a user gesture (touchstart / touchend / click).
// Calls ac.resume() synchronously so iOS recognises the gesture, then
// awaits the promise to confirm running state.
export async function unlockAudio(): Promise<void> {
  if (webAudioOk) return;
  try {
    const ac = getCtx();
    log(`unlockAudio state=${ac.state}`);
    await ac.resume();                   // called sync in gesture; await for result
    log(`resume resolved state=${ac.state}`);
    if (ac.state === 'running') {
      const b = ac.createBuffer(1, 1, 22050);
      const s = ac.createBufferSource();
      s.buffer = b; s.connect(ac.destination); s.start(0);
      webAudioOk = true;
      log('WebAudio UNLOCKED');
    } else {
      log(`NOT running after resume. state=${ac.state}`);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    lastError = msg;
    log('unlockAudio error: ' + msg);
  }
}

if (typeof document !== 'undefined') {
  const h = () => { void unlockAudio(); };
  document.addEventListener('touchstart', h, { once: true, capture: true, passive: true });
  document.addEventListener('touchend',   h, { once: true, capture: true, passive: true });
  document.addEventListener('mousedown',  h, { once: true, capture: true, passive: true });
  document.addEventListener('click',      h, { once: true, capture: true, passive: true });
}

export function getAudioDebugInfo() {
  return {
    webAudioOk,
    ctxExists: ctx !== null,
    ctxState: ctx?.state ?? 'no-context',
    sampleRate: ctx?.sampleRate ?? 0,
    currentTime: ctx?.currentTime ?? 0,
    lastError,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}

// ─── Playback ─────────────────────────────────────────────────────────
// If context isn't running yet, skip the sound rather than queuing it.
// Queuing causes a burst of stacked sounds the moment context unlocks.
function playWeb(fn: (ac: AudioContext) => void) {
  try {
    const ac = getCtx();
    if (ac.state !== 'running') {
      log(`playWeb: ctx ${ac.state} → skip`);
      return;
    }
    fn(ac);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    lastError = 'playWeb: ' + msg;
    log('playWeb error: ' + msg);
  }
}

export function useSound() {
  function playStep(step: number) {
    playWeb(ac => {
      const freq = 440 * Math.pow(1.04, Math.min(step, 24));
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.22, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.12);
    });
  }

  function playGoal() {
    playWeb(ac => {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const t = ac.currentTime + i * 0.18;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.start(t); osc.stop(t + 0.38);
      });
    });
  }

  function playReset() {
    playWeb(ac => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.18);
    });
  }

  return { playStep, playGoal, playReset, unlockAudio };
}
