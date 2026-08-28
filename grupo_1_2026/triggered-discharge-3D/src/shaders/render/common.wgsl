struct RenU {
  viewProj: mat4x4f,
  invVP:    mat4x4f,
  camRight: vec4f,
  camUp:    vec4f,
  camPos:   vec4f,
  strike:   vec4f,   // xyz world, w = flash luminance
  misc0:    vec4f,   // time, leaderMul, branchFlash, exposure
  misc1:    vec4f,   // boltSeed, grain, bloomStr, caStr
  misc2:    vec4f,   // strokeType, tStroke(µs), chanLen(m), tipPP
  ha:       vec4f,   // i0a, t1a, t2a, —
  hb:       vec4f,   // i0b, t1b, t2b, —
  dims:     vec4f,   // GW, GH, GD, CELL_M
  res:      vec4f,   // width, height, topAlt(m), —
};
fn h21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q = q + dot(q, q + 33.33);
  return fract(q.x * q.y);
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = h21(i);                   let b = h21(i + vec2f(1.0, 0.0));
  let c = h21(i + vec2f(0.0, 1.0)); let d = h21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}
fn fbm(p0: vec2f) -> f32 {
  var p = p0; var a = 0.5; var s = 0.0;
  for (var k = 0; k < 5; k = k + 1) {
    s = s + a * vnoise(p);
    p = p * 2.03 + vec2f(17.1, 9.3);
    a = a * 0.5;
  }
  return s;
}
/* ---------------- return-stroke electrodynamics ----------------
   Base current: Heidler waveform (two terms for subsequent strokes,
   Rachidi parameters). MTLE transport up the channel:

       i(z,t) = i(0, t - z/v) * e^(-z/λ),   v = 1.3e8 m/s, λ = 2 km

   Optical output L ∝ i^1.4; channel radius ∝ i^⅓ (Braginskii).
   Keep the epistemic split straight: Heidler and MTLE are
   MEASUREMENT-DERIVED (tower data, optical v estimates). The two lines
   below - current to screen luminance, current to on-screen radius -
   are RENDERING APPROXIMATIONS. The exponents come from the
   literature; the coefficients are mine, picked to look right in HDR. */
const V_RS:   f32 = 130.0;    // m per microsecond
const LAMBDA: f32 = 2000.0;   // metres
fn heidler(t: f32, i0: f32, t1: f32, t2: f32) -> f32 {
  if (t <= 0.0 || i0 <= 0.0) { return 0.0; }
  let x  = (t / t1) * (t / t1);
  let ec = exp(-(t1 / t2) * sqrt(2.0 * t2 / t1));
  return (i0 / ec) * (x / (1.0 + x)) * exp(-t / t2);
}
fn baseCurrent(r: RenU, t: f32) -> f32 {
  return heidler(t, r.ha.x, r.ha.y, r.ha.z) + heidler(t, r.hb.x, r.hb.y, r.hb.z);
}
fn lumOfCurrent(iKA: f32) -> f32 {
  return 96.0 * pow(max(iKA, 0.0) / 30.0, 1.4);   // RENDER APPROX (exponent lit., scale ours)
}
