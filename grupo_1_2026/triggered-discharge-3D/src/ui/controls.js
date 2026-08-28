/* ---------------- sliders and buttons ---------------- */

import { $ } from "../core/dom.js";
import { bolt, rt, ui } from "../core/state.js";
import { ensureAudio } from "../audio/thunder.js";
import { newBolt } from "../sim/bolt.js";

export const bind = (id, out, fmt, set) => {
  const el = $(id);
  el.addEventListener("input", () => {
    set(parseFloat(el.value));
    $(out).textContent = fmt(parseFloat(el.value));
  });
};
bind(
  "eta",
  "oEta",
  (v) => v.toFixed(2),
  (v) => (ui.eta = v),
);
bind(
  "cur",
  "oCur",
  (v) => v.toFixed(0),
  (v) => (ui.I0 = v),
);
bind(
  "dil",
  "oDil",
  (v) => v.toFixed(2),
  (v) => (ui.dilation = v),
);
bind(
  "exp",
  "oExp",
  (v) => v.toFixed(2),
  (v) => (ui.exposure = v),
);
bind(
  "blm",
  "oBlm",
  (v) => v.toFixed(2),
  (v) => (ui.bloom = v),
);
$("bNew").addEventListener("click", () => newBolt());
$("bStorm").addEventListener("click", () => {
  ui.storm = !ui.storm;
  $("bStorm").setAttribute("aria-pressed", ui.storm);
  if (ui.storm && bolt.phase === "fade") newBolt();
});
$("bPause").addEventListener("click", () => {
  ui.paused = !ui.paused;
  $("bPause").textContent = ui.paused ? "RESUME" : "PAUSE";
  $("bPause").setAttribute("aria-pressed", ui.paused);
});
$("bSnd").addEventListener("click", () => {
  ui.sound = !ui.sound;
  if (ui.sound) ensureAudio();
  $("bSnd").textContent = ui.sound ? "SOUND ON" : "SOUND OFF";
  $("bSnd").setAttribute("aria-pressed", ui.sound);
});
$("bPng").addEventListener("click", () => {
  rt.pngFlag = true;
});
$("bPol").addEventListener("click", () => {
  ui.positive = !ui.positive;
  $("bPol").textContent = ui.positive ? "POLARITY +CG" : "POLARITY −CG";
  $("bPol").setAttribute("aria-pressed", ui.positive);
  newBolt();
});
