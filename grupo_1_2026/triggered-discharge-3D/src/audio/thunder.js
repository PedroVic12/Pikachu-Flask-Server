/* ----------------------------------------------------------------
   Thunder. Every sampled channel segment is its own acoustic source,
   delayed by its true distance to the camera and low-passed by how
   far it travelled. The rumble's length is the bolt's geometry.
   ---------------------------------------------------------------- */

import { SND_C } from "../config.js";

export let AC = null,
  master = null;
export function noiseBuffer(dur, brown) {
  const len = Math.floor(AC.sampleRate * dur);
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      b = (b + 0.02 * w) / 1.02;
      d[i] = b * 3.5;
    } else d[i] = w;
  }
  return buf;
}
export function ensureAudio() {
  if (AC) {
    AC.resume();
    return;
  }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain();
  master.gain.value = 0.8;
  master.connect(AC.destination);
}
export function thunder(peakKA, segs) {
  if (!AC) return;
  const t0 = AC.currentTime;
  const shot = (buf, freq, q, gain, dec, at) => {
    if (gain < 0.004) return;
    const s = AC.createBufferSource();
    s.buffer = buf;
    const f = AC.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = AC.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0008, at + dec);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(at);
    s.stop(at + dec + 0.1);
  };

  /* the crack: the nearest segment only - a sharp N-wave survives just
     the shortest path; air absorbs HF with every extra kilometre */
  const near = segs[0];
  const v0 = Math.min(1, peakKA / 30) * Math.min(1, 1600 / near.d);
  const hf0 = 1 / (1 + near.d / 1400);
  const tNear = t0 + Math.max(0.02, near.d / SND_C);
  shot(
    noiseBuffer(0.5, false),
    700 + 1900 * hf0,
    0.8,
    0.55 * v0 * hf0,
    0.16,
    tNear,
  );

  /* the rumble: EVERY sampled segment arrives on its own clock. The
     rumble's duration is (far - near)/343 - the bolt's geometry, heard.
     Higher segments carry the return stroke's decayed current: quieter,
     and their extra path length low-passes them into the boom. */
  const norm = 0.9 / Math.sqrt(segs.length);
  for (const sg of segs) {
    const at = t0 + Math.max(0.02, sg.d / SND_C);
    const v = Math.min(1, peakKA / 30) * Math.min(1, 1600 / sg.d) * norm;
    const hf = 1 / (1 + sg.d / 1400);
    const hi = Math.exp(-sg.frac * 1.1); // MTLE: current decays with altitude
    shot(
      noiseBuffer(0.45 + Math.random() * 0.3, false),
      180 + 420 * hf,
      0.6,
      0.75 * v * hi * (0.6 + Math.random() * 0.8),
      0.5 + Math.random() * 0.5,
      at,
    );
  }

  /* the after-roll: reflections and scattering, seeded from the arrival
     window so a long bolt rolls longer than a short one */
  const spread = segs[segs.length - 1].d - near.d;
  const dur = 2.5 + (spread / SND_C) * 2 + near.d / 900;
  const s2 = AC.createBufferSource();
  s2.buffer = noiseBuffer(dur, true);
  const f2 = AC.createBiquadFilter();
  f2.type = "lowpass";
  f2.frequency.value = 95;
  const g2 = AC.createGain();
  const steps = 26,
    curve = new Float32Array(steps);
  for (let i = 0; i < steps; i++)
    curve[i] =
      0.4 * v0 * Math.exp(-i / (steps * 0.45)) * (0.4 + Math.random());
  curve[steps - 1] = 0.0001;
  g2.gain.setValueCurveAtTime(curve, tNear + 0.1, dur - 0.2);
  s2.connect(f2);
  f2.connect(g2);
  g2.connect(master);
  s2.start(tNear + 0.08);
  s2.stop(tNear + dur);
}
