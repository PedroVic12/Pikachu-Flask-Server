/* ----------------------------------------------------------------
   Orbit, pinch-zoom, and click-to-strike (ray through the ground
   plane -> nearest lattice column -> trigger a bolt there).
   ---------------------------------------------------------------- */

import { $, canvas } from "../core/dom.js";
import { CELL_M, GD, GW } from "../config.js";
import { cam, rt } from "../core/state.js";
import { newBolt } from "../sim/bolt.js";

export const touches = new Map();
export let pinchD = 0;
canvas.addEventListener("pointerdown", (ev) => {
  touches.set(ev.pointerId, [ev.clientX, ev.clientY]);
  cam.dragging = true;
  cam.idle = 0;
  cam.lastX = cam.downX = ev.clientX;
  cam.lastY = cam.downY = ev.clientY;
  canvas.setPointerCapture(ev.pointerId);
  if (touches.size === 2) {
    const [a, b] = [...touches.values()];
    pinchD = Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
});
canvas.addEventListener("pointermove", (ev) => {
  if (!touches.has(ev.pointerId)) return;
  touches.set(ev.pointerId, [ev.clientX, ev.clientY]);
  cam.idle = 0;
  if (touches.size === 2) {
    // pinch = zoom
    const [a, b] = [...touches.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinchD > 0)
      cam.radius = Math.max(
        1200,
        Math.min(16000, (cam.radius * pinchD) / d),
      );
    pinchD = d;
    return;
  }
  if (!cam.dragging) return;
  cam.az -= (ev.clientX - cam.lastX) * 0.005;
  cam.el = Math.max(
    0.03,
    Math.min(1.2, cam.el + (ev.clientY - cam.lastY) * 0.004),
  );
  cam.lastX = ev.clientX;
  cam.lastY = ev.clientY;
});
export const endTouch = (ev) => {
  touches.delete(ev.pointerId);
  if (touches.size < 2) pinchD = 0;
};
canvas.addEventListener("pointercancel", endTouch);
canvas.addEventListener("pointerup", (ev) => {
  endTouch(ev);
  cam.dragging = touches.size > 0;
  if (touches.size > 0) return;
  if (
    Math.hypot(ev.clientX - cam.downX, ev.clientY - cam.downY) < 6 &&
    rt.invVP
  ) {
    /* click -> ray -> ground plane -> trigger a bolt above that point */
    const nx = (ev.clientX / innerWidth) * 2 - 1,
      ny = 1 - (ev.clientY / innerHeight) * 2;
    const un = (m, v) => {
      const o = [0, 0, 0, 0];
      for (let r = 0; r < 4; r++)
        o[r] =
          m[r] * v[0] +
          m[4 + r] * v[1] +
          m[8 + r] * v[2] +
          m[12 + r] * v[3];
      return o;
    };
    const p0 = un(rt.invVP, [nx, ny, 0, 1]),
      p1 = un(rt.invVP, [nx, ny, 1, 1]);
    const ro = [p0[0] / p0[3], p0[1] / p0[3], p0[2] / p0[3]];
    const rd = [
      p1[0] / p1[3] - ro[0],
      p1[1] / p1[3] - ro[1],
      p1[2] / p1[3] - ro[2],
    ];
    if (rd[1] < -1e-4) {
      const tt = -ro[1] / rd[1];
      const wx = ro[0] + rd[0] * tt,
        wz = ro[2] + rd[2] * tt;
      newBolt(
        Math.round(wx / CELL_M + GW / 2),
        Math.round(wz / CELL_M + GD / 2),
      );
      $("hint").style.opacity = 0;
    }
  }
});
canvas.addEventListener(
  "wheel",
  (ev) => {
    ev.preventDefault();
    cam.radius = Math.max(
      1200,
      Math.min(16000, cam.radius * Math.exp(ev.deltaY * 0.001)),
    );
    cam.idle = 0;
  },
  { passive: false },
);
