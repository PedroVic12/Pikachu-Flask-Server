/* ----------------------------------------------------------------
   3-D box counting on the frozen channel, plus the x-y projection -
   the projection is what a camera sees, and photographed lightning
   measures D ~= 1.7.
   ---------------------------------------------------------------- */

import { $ } from "../core/dom.js";
import { GD, GH, GW, N } from "../config.js";
import { bolt } from "../core/state.js";

export function fractalDim(fl) {
  const sizes = [2, 4, 8, 16];
  const l3 = [],
    l2 = [],
    li = [];
  for (const bs of sizes) {
    const bx = Math.ceil(GW / bs),
      by = Math.ceil(GH / bs),
      bz = Math.ceil(GD / bs);
    const occ3 = new Uint8Array(bx * by * bz),
      occ2 = new Uint8Array(bx * by);
    let n3 = 0,
      n2 = 0;
    for (let i = 0; i < N; i++) {
      if ((fl[i] & 5) === 0) continue; // not channel (either tree)
      const x = ((i % GW) / bs) | 0,
        y = ((((i / GW) | 0) % GH) / bs) | 0,
        z = (i / (GW * GH) / bs) | 0;
      const k3 = (z * by + y) * bx + x,
        k2 = y * bx + x;
      if (!occ3[k3]) {
        occ3[k3] = 1;
        n3++;
      }
      if (!occ2[k2]) {
        occ2[k2] = 1;
        n2++;
      }
    }
    l3.push(Math.log(n3));
    l2.push(Math.log(n2));
    li.push(Math.log(1 / bs));
  }
  const fit = (ly) => {
    const n = li.length,
      mx = li.reduce((a, b) => a + b) / n,
      my = ly.reduce((a, b) => a + b) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (li[i] - mx) * (ly[i] - my);
      den += (li[i] - mx) ** 2;
    }
    return num / den;
  };
  bolt.dim3 = fit(l3);
  bolt.dim2 = fit(l2);
  $("rDim").textContent =
    bolt.dim2.toFixed(2) + " (3D " + bolt.dim3.toFixed(2) + ")";
}
