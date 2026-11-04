// Sea sound made in the browser: filtered noise that swells like waves, softer indoors,
// and a splash for each stroke of the oar. Starts on the first click (browsers require one).

const KEY = 'livy.sound';
let ctx = null;
let master = null;
let filter = null;
let swell = null;
let noise = null;
let on = true;
try { on = localStorage.getItem(KEY) !== 'off'; } catch {}

export const isOn = () => on;

function noiseBuffer() {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  // Pink-ish noise (Paul Kellet's filter).
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57 * b2 + w * 1.0526913;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
  }
  return buf;
}

export function start() {
  if (ctx) {
    ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  noise = noiseBuffer();
  master = ctx.createGain();
  master.gain.value = on ? 1 : 0;
  master.connect(ctx.destination);

  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  swell = ctx.createGain();
  swell.gain.value = 0.5;
  // Two slow oscillators move the volume, so the swell never repeats exactly.
  for (const [f, depth] of [[0.11, 0.22], [0.047, 0.15]]) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = f;
    const amt = ctx.createGain();
    amt.gain.value = depth;
    lfo.connect(amt).connect(swell.gain);
    lfo.start();
  }
  src.connect(filter).connect(swell).connect(master);
  src.start();
}

export function setInside(inside) {
  if (!ctx) return;
  const now = ctx.currentTime;
  filter.frequency.setTargetAtTime(inside ? 260 : 520, now, 0.6);
  swell.gain.setTargetAtTime(inside ? 0.28 : 0.5, now, 0.6);
}

export function splash() {
  if (!ctx || !on) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900 + Math.random() * 400;
  bp.Q.value = 0.8;
  const g = ctx.createGain();
  const now = ctx.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.5, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  src.connect(bp).connect(g).connect(master);
  src.start(now, Math.random() * 3, 0.8);
}

export function setOn(next) {
  on = next;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
  if (master) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.2);
}
