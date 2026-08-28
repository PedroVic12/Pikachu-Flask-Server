/* the handful of DOM handles the rest of the app pokes at */

export const $ = (id) => document.getElementById(id);
export const canvas = $("gpu");
export const prefersStill = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
