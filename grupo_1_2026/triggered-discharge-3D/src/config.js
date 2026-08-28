/* ----------------------------------------------------------------
   Lattice size, the physical constants every module needs, and the
   one mapping between a cell index and a point in metres.
   ---------------------------------------------------------------- */

/* phone GPUs get a coarser lattice; the physics is resolution-independent
   because every rate is expressed in metres and seconds via CELL_M */
export const MOBILE = matchMedia("(pointer:coarse)").matches || innerWidth < 830;
export const GW = MOBILE ? 80 : 112,
  GH = MOBILE ? 128 : 176,
  GD = MOBILE ? 80 : 112;
export const N = GW * GH * GD;
export const CELL_M = Math.round(4600 / GH); // 26 m desktop, 36 m mobile → 4.6 km domain
export const JACOBI_ITERS = MOBILE ? 8 : 12; // per frame (even → result lands in phiA)
export const LIST_CAP = 1 << 18;
export const TER_MIN = Math.floor(0.905 * GH); // highest possible terrain row


export const PHYS = {
  V_LEADER: 2.0e5, // stepped-leader TIP speed, m/s (closed-loop enforced)
  V_DSTEP: 2.0e6, // dart-stepped leader tip speed, m/s
  V_DART: 1.2e7, // dart-leader speed, m/s
  V_RS: 1.3e8, // return-stroke front, m/s  (c/3, MTLE)
  // BRANCH_RATIO retired: total-growth pacing is now closed-loop on tip speed
  SLOMO: {
    grow: 150,
    regrow: 900,
    attach: 4000,
    strokeFront: 20000,
    strokeTail: 1500,
    inter: 25,
    dart: 2500,
    cc: 60,
  },
};
export const SND_C = 343; // speed of sound, m/s

/* cell index -> world position in metres (y up, origin at grid centre) */
export const idxToWorld = (idx) => {
  const x = idx % GW,
    y = ((idx / GW) | 0) % GH,
    z = (idx / (GW * GH)) | 0;
  return [
    (x + 0.5 - GW / 2) * CELL_M,
    (GH - 1 - y) * CELL_M,
    (z + 0.5 - GD / 2) * CELL_M,
  ];
};
