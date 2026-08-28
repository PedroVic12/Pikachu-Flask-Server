/* ----------------------------------------------------------------
   Packing the two uniform buffers. Byte layouts here must match the
   SimU struct in shaders/compute/common.wgsl and the RenU struct in
   shaders/render/common.wgsl - change one, change the other.
   ---------------------------------------------------------------- */

import { CELL_M, GD, GH, GW } from "../config.js";
import { bolt, cam, rt, ui } from "./state.js";
import { canvas, prefersStill } from "./dom.js";
import { device, renUBuf, simUBuf } from "./gpu.js";
import { m4inv, m4look, m4mul, m4persp } from "../physics/mat4.js";

export const simAB = new ArrayBuffer(64);
export const simU32 = new Uint32Array(simAB),
  simF32 = new Float32Array(simAB);
export function writeSimU() {
  simU32[0] = GW;
  simU32[1] = GH;
  simU32[2] = GD;
  simU32[3] = bolt.seed;
  simU32[4] = bolt.seedX;
  simU32[5] = bolt.seedZ;
  simU32[6] = rt.frameNo;
  simU32[7] = bolt.upOn ? 1 : 0;
  simF32[8] = bolt.boltSeed;
  simF32[9] = ui.eta + (ui.positive ? 0.8 : 0) - (ui.storm ? 0.35 : 0);
  simF32[10] = bolt.simTime;
  simF32[11] = 0;
  simU32[12] = bolt.forkIdx >>> 0;
  simU32[13] = bolt.regrow ? 1 : 0;
  device.queue.writeBuffer(simUBuf, 0, simAB);
}
export const renF = new Float32Array(76);
export function writeRenU(dt) {
  /* camera */
  if (!cam.dragging && cam.idle > 1.5) cam.az += dt * 0.028;
  cam.idle += dt;
  const ce = Math.cos(cam.el),
    se = Math.sin(cam.el);
  const eye = [
    cam.target[0] + cam.radius * ce * Math.sin(cam.az),
    cam.target[1] + cam.radius * se,
    cam.target[2] + cam.radius * ce * Math.cos(cam.az),
  ];
  rt.camPos = eye;
  const view = m4look(eye, cam.target, [0, 1, 0]);
  const proj = m4persp(
    (48 * Math.PI) / 180,
    canvas.width / canvas.height,
    20,
    60000,
  );
  const vp = m4mul(proj, view);
  rt.invVP = m4inv(vp);
  const e = bolt.env,
    s = bolt.schedule[bolt.strokeIdx] || {
      i0a: ui.I0,
      t1a: 1.8,
      t2a: 95,
      i0b: 0,
      t1b: 1,
      t2b: 1,
    };
  renF.set(vp, 0);
  renF.set(rt.invVP, 16);
  renF.set([view[0], view[4], view[8], 0], 32); // camRight
  renF.set([view[1], view[5], view[9], 0], 36); // camUp
  renF.set([...eye, 0], 40);
  renF.set([...bolt.strikeW, e.flashLum], 44);
  renF.set([bolt.simTime, e.leaderMul, e.branchFlash, ui.exposure], 48);
  renF.set(
    [bolt.boltSeed, prefersStill ? 0 : 0.016, ui.bloom, 0.004],
    52,
  );
  renF.set([e.strokeType, e.tStroke, bolt.chanLen, e.tipPP], 56);
  const spriteT =
    bolt.spriteV0 > 0
      ? Math.min(1, Math.max(0, (bolt.simTime - bolt.spriteV0) / 1.1))
      : 0;
  renF.set([s.i0a, s.t1a, s.t2a, bolt.windX], 60);
  renF.set([s.i0b, s.t1b, s.t2b, bolt.windZ], 64);
  renF.set([GW, GH, GD, CELL_M], 68);
  renF.set([canvas.width, canvas.height, (GH - 1) * CELL_M, spriteT], 72);
  device.queue.writeBuffer(renUBuf, 0, renF);
}
