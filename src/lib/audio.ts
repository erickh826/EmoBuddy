let hasInteracted = false;

function setInteracted() {
  hasInteracted = true;
}

// Set interacted flag on first user interaction
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", setInteracted, { once: true });
  window.addEventListener("keydown", setInteracted, { once: true });
}

// Simple audio using Web Audio API for generated tones (no external files needed)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.1
) {
  if (!hasInteracted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playMoveSound(muted: boolean) {
  if (muted) return;
  playTone(400, 0.1, "sine", 0.05);
}

export function playCollectSound(muted: boolean) {
  if (muted) return;
  playTone(600, 0.2, "sine", 0.08);
  setTimeout(() => playTone(800, 0.2, "sine", 0.08), 150);
}

export function playErrorSound(muted: boolean) {
  if (muted) return;
  playTone(200, 0.1, "sine", 0.03);
}

export function playCompleteSound(muted: boolean) {
  if (muted) return;
  playTone(523, 0.2, "sine", 0.08); // C5
  setTimeout(() => playTone(659, 0.2, "sine", 0.08), 200); // E5
  setTimeout(() => playTone(784, 0.3, "sine", 0.08), 400); // G5
}

export function playUnlockSound(muted: boolean) {
  if (muted) return;
  playTone(440, 0.15, "sine", 0.08); // A4
  setTimeout(() => playTone(880, 0.3, "sine", 0.08), 150); // A5
}
