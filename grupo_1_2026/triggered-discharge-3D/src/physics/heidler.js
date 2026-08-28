/* ----------------------------------------------------------------
   CPU copy of the return-stroke current. render/common.wgsl has its
   own copy - the two MUST stay in step, because the HUD readout and
   the flash brightness come from here while the pixels come from
   there.
   ---------------------------------------------------------------- */

export function heidlerJS(t, i0, t1, t2) {
  if (t <= 0 || i0 <= 0) return 0;
  const x = (t / t1) ** 2;
  const ec = Math.exp(-(t1 / t2) * Math.sqrt((2 * t2) / t1));
  return (i0 / ec) * (x / (1 + x)) * Math.exp(-t / t2);
}
export const lumOfJS = (i) => 96 * Math.pow(Math.max(i, 0) / 30, 1.4);
