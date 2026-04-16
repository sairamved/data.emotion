"use client";

const TAP_FILES = [
  "/audio/taps/tap_01.wav",
  "/audio/taps/tap_02.wav",
  "/audio/taps/tap_03.wav",
  "/audio/taps/tap_04.wav",
  "/audio/taps/tap_05.wav",
];

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;
  try {
    const ctx = getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

// Preload all tap sounds
export function preloadTaps() {
  TAP_FILES.forEach((f) => loadBuffer(f));
}

export async function playTap() {
  try {
    const ctx = getAudioContext();
    const file = TAP_FILES[Math.floor(Math.random() * TAP_FILES.length)];
    const buffer = await loadBuffer(file);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {}
}
