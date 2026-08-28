/* ----------------------------------------------------------------
   The physical clock and the phase machine.

   Every phase carries its own slow-motion factor and advances real
   seconds, not frames - so the stepped leader really does crawl at
   2e5 m/s and the return stroke really does cross the channel at
   c/3, however fast the GPU happens to be.
   ---------------------------------------------------------------- */

import { CELL_M, PHYS } from "../config.js";
import { bolt, rt, ui } from "../core/state.js";
import { device, selBuf, upSelBuf } from "../core/gpu.js";
import { heidlerJS, lumOfJS } from "../physics/heidler.js";
import { newBolt, setPhase, startStroke } from "./bolt.js";

export function slomoNow() {
  const s = bolt.schedule[bolt.strokeIdx];
  switch (bolt.phase) {
    case "grow":
      return ui.storm ? 34 : PHYS.SLOMO.grow;
    case "attach":
      return PHYS.SLOMO.attach;
    case "regrow":
      return PHYS.SLOMO.regrow;
    case "stroke": {
      const frontUs = bolt.chanLen / (PHYS.V_RS * 1e-6);
      return bolt.phaseTR * 1e6 < frontUs + 40
        ? PHYS.SLOMO.strokeFront
        : PHYS.SLOMO.strokeTail;
    }
    case "inter":
      return PHYS.SLOMO.inter;
    case "dart":
      return PHYS.SLOMO.dart;
    case "cc":
      return PHYS.SLOMO.cc;
    default:
      return 1;
  }
}
export function updatePhase(dt) {
  const e = bolt.env;
  e.leaderMul = 0;
  e.branchFlash = 0;
  e.strokeType = 0;
  e.tStroke = 0;
  e.tipPP = 0;
  e.flashLum = 0;
  e.curKA = 0;
  bolt.growSteps = 0;

  const slomo = slomoNow() * ui.dilation;
  bolt.slomoNow = slomo;
  const dtR = ui.paused ? 0 : dt / slomo;
  bolt.tReal += dtR;
  bolt.phaseTR += dtR;
  /* ribbon lightning: the old channel drifts with the wind between and
     during the later strokes (exaggerated 25x to survive our cell size) */
  if (
    bolt.strokeIdx > 0 ||
    ["inter", "dart", "cc"].includes(bolt.phase)
  ) {
    bolt.windT += dtR;
    bolt.windX = bolt.windVX * bolt.windT * 25;
    bolt.windZ = bolt.windVZ * bolt.windT * 25;
  }
  bolt.phaseTV += ui.paused ? 0 : dt;
  bolt.simTime += ui.paused ? 0 : dt;

  if (bolt.phase === "grow" || bolt.phase === "regrow") {
    e.leaderMul = 1;
    e.curKA = 0.15; // leader currents ~100 A
    /* CLOSED LOOP on tip velocity: 2e5 m/s is the speed of the DEEPEST
       DESCENDING TIP, not of total tree growth. I measure the tip's
       actual descent from the deepY readback and steer the step rate
       until measured speed matches V_LEADER - the branch count is then
       whatever the lottery produces, as it should be. */
    const vT = bolt.phase === "regrow" ? PHYS.V_DSTEP : PHYS.V_LEADER;
    bolt.stepAcc += ((vT * dtR) / CELL_M) * bolt.stepGain;
    bolt.growSteps = Math.min(10, Math.floor(bolt.stepAcc));
    bolt.stepAcc -= bolt.growSteps;
  } else if (bolt.phase === "attach") {
    e.leaderMul = 1.6;
    e.flashLum = 1.4;
    e.curKA = 0.9; // upward connecting leader
    if (bolt.phaseTR > 70e-6 && bolt.schedule.length)
      startStroke(bolt.nextStroke);
  } else if (bolt.phase === "stroke") {
    const s = bolt.schedule[bolt.strokeIdx];
    const tUs = bolt.phaseTR * 1e6;
    const iNow =
      heidlerJS(tUs, s.i0a, s.t1a, s.t2a) +
      heidlerJS(tUs, s.i0b, s.t1b, s.t2b);
    e.strokeType = 1;
    e.tStroke = tUs;
    e.branchFlash = s.first ? 1 : 0;
    e.curKA = iNow;
    e.flashLum = lumOfJS(iNow) * 0.8;
    const frontUs = bolt.chanLen / (PHYS.V_RS * 1e-6);
    if (tUs > frontUs + 6 * Math.max(s.t2a, s.t2b)) {
      if (bolt.strokeIdx + 1 < bolt.schedule.length)
        setPhase("inter", "INTERSTROKE");
      else if (bolt.ccBumps) setPhase("cc", "CONTINUING CURRENT");
      else setPhase("fade", "RECOVERY");
    }
  } else if (bolt.phase === "inter") {
    e.leaderMul = 0.09 * Math.exp(-bolt.phaseTR / 0.018); // cooling channel afterglow
    /* recoil leaders: pulses racing back down decayed branches */
    if (bolt.recoilM >= 0) {
      const rt = (bolt.phaseTV - bolt.recoilT0) / 0.13;
      if (rt >= 1) bolt.recoilM = -1;
      else {
        e.strokeType = 4;
        e.tStroke = 1 - rt;
        e.tipPP = bolt.recoilM;
      }
    } else if (bolt.recoilN > 0 && Math.random() < dt * 2.2) {
      bolt.recoilM = (Math.random() * bolt.recoilN) | 0;
      bolt.recoilT0 = bolt.phaseTV;
    }
    const dartDur = bolt.chanLen / PHYS.V_DART;
    if (bolt.phaseTR > bolt.schedule[bolt.strokeIdx].gap - dartDur) {
      const nxt = bolt.schedule[bolt.strokeIdx + 1];
      if (
        nxt &&
        nxt.stepped &&
        bolt.pathCells &&
        bolt.pathCells.length > 20
      )
        beginFork();
      else setPhase("dart", "DART LEADER");
    }
  } else if (bolt.phase === "dart") {
    e.strokeType = 2;
    e.curKA = 1.1;
    e.flashLum = 2.5;
    e.tipPP = Math.max(
      0,
      1 - (bolt.phaseTR * PHYS.V_DART) / bolt.chanLen,
    );
    if (e.tipPP <= 0) startStroke(bolt.strokeIdx + 1);
  } else if (bolt.phase === "regrow") {
  /* dart-stepped: a leader dives the old channel to the fork, then goes
     back to STEPPING - the growth machinery restarts from the fork cell
     and hunts a new termination. Bail to a plain dart if it dawdles. */
    if (bolt.phaseTR > 0.012) {
      bolt.regrow = false;
      setPhase("dart", "DART LEADER");
    }
  } else if (bolt.phase === "cc") {
    let lum = 2.4,
      amps = 0.12; // ~100 A continuing current
    for (const b of bolt.ccBumps) {
      const d = bolt.phaseTR - b.t;
      if (d > 0) {
        lum += b.amp * 14 * Math.exp(-d / 0.004);
        amps += b.amp * Math.exp(-d / 0.004);
      }
    }
    e.strokeType = 3;
    e.tipPP = lum;
    e.flashLum = lum * 2.6;
    e.curKA = amps;
    if (bolt.phaseTR > bolt.ccDur) setPhase("fade", "RECOVERY");
  } else if (bolt.phase === "fade") {
    e.flashLum = Math.max(0, 0.5 - bolt.phaseTV * 0.6);
    /* STORM: barrage - the next cell is already charging */
    const gapS = ui.storm
      ? 0.15 + Math.random() * 0.5
      : 1.3 + Math.random() * 1.5;
    if (bolt.phaseTV > gapS) newBolt();
  }
}

/* enter the dart-stepped phase: pick a fork 35-75 percent down the arc,
   reset both lotteries, wipe+reseed frontiers on the GPU, resume growth */
export function beginFork() {
  const cum = bolt.pathCum,
    path = bolt.pathCells;
  const target = (0.35 + Math.random() * 0.4) * bolt.chanLen;
  let k = 0;
  while (k < path.length - 1 && cum[k] < target) k++;
  bolt.forkIdx = path[k];
  bolt.regrow = true;
  bolt.nextStroke = bolt.strokeIdx + 1;
  bolt.upOn = false;
  bolt.deepY = 0;
  bolt.deepT = bolt.tReal;
  bolt.stepGain = 6;
  bolt.tipV = 0;
  bolt.stepAcc = 0;
  device.queue.writeBuffer(
    selBuf,
    0,
    new Uint32Array([0, 0, (Math.random() * 1e9) | 0, 0, 0, 0, 0, 0]),
  );
  device.queue.writeBuffer(
    upSelBuf,
    0,
    new Uint32Array([
      0,
      0,
      0x40000000 + ((Math.random() * 1e6) | 0),
      0,
      0,
      0,
      0,
      0,
    ]),
  );
  rt.needFork = true;
  setPhase("regrow", "DART-STEPPED LEADER");
}

/* fractal dimension of the frozen tree: 3-D box counting over the
   channel cells (both trees), plus the x-y projection - the projection
   is what a camera photographs, and photographs of lightning measure
   D ~= 1.7. Slope of log(boxes) vs log(1/size) over sizes 2..16. */
