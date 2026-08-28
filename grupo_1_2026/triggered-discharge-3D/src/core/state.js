/* ----------------------------------------------------------------
   All mutable state, in one place.

   `ui`   what the sliders and buttons are set to
   `bolt` everything about the flash currently on screen
   `cam`  orbit camera
   `rt`   per-frame runtime flags (readbacks in flight, etc.)
   ---------------------------------------------------------------- */

import { GD, GW, JACOBI_ITERS, PHYS } from "../config.js";

export const ui = {
  eta: 2.0,
  I0: 30,
  dilation: 1,
  exposure: 1.2,
  bloom: 0.7,
  paused: false,
  sound: false,
  positive: false,
  storm: false,
};

export const bolt = {
  phase: "grow",
  label: "STEPPED LEADER",
  tReal: 0,
  phaseTR: 0,
  phaseTV: 0,
  simTime: 0,
  seedX: GW >> 1,
  seedZ: GD >> 1,
  seed: 1,
  boltSeed: Math.random(),
  strikeW: [0, 0, 0],
  sidx: 0,
  cells: 5,
  dim: null,
  chanLen: 0,
  stepAcc: 0,
  growSteps: 0,
  stepGain: 6,
  tipV: 0,
  deepT: 0,
  forkIdx: 0,
  regrow: false,
  nextStroke: 0,
  schedule: [],
  strokeIdx: 0,
  ccBumps: [],
  thunderPerf: -1,
  thunderDist: 0,
  env: {
    leaderMul: 1,
    branchFlash: 0,
    strokeType: 0,
    tStroke: 0,
    tipPP: 0,
    flashLum: 0,
    curKA: 0,
  },
  slomoNow: PHYS.SLOMO.grow,
};

/* camera */
export const cam = {
  az: 0.7,
  el: 0.17,
  radius: 5600,
  target: [0, 1450, 0],
  dragging: false,
  lastX: 0,
  lastY: 0,
  downX: 0,
  downY: 0,
  idle: 0,
};


/* ----------------------------------------------------------------
   Per-frame runtime flags. These used to be loose `let`s in the one
   big closure; now that the code is split across modules they live
   in one mutable bag so every module reads and writes the same copy
   (you cannot assign to an imported binding).
   ---------------------------------------------------------------- */
export const rt = {
  selPending: false,      // sel buffer readback in flight
  parentPending: false,   // parent buffer readback in flight
  needParents: false,     // strike happened, pull the parent pointers
  flagsPending: false,    // flags readback in flight (fractal dimension)
  needFractal: false,     // channel frozen, measure D
  needFork: false,        // dart-stepped leader wants a fork this frame
  resPending: false,      // residual probe readback in flight
  jacIters: JACOBI_ITERS, // adaptive Jacobi budget, steered by residNow
  residNow: 0,            // last measured field residual
  lastT: 0,               // previous rAF timestamp, ms
  frameNo: 0,
  pngFlag: false,         // grab the framebuffer after this frame
  invVP: null,            // inverse view-projection, for ground picking
  camPos: [0, 0, 0],
};
