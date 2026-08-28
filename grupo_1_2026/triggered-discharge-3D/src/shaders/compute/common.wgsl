struct SimU {
  gw: u32, gh: u32, gd: u32, seed: u32,
  seedX: u32, seedZ: u32, frame: u32, upOn: u32,
  bs: f32, eta: f32, time: f32, pad1: f32,
  forkIdx: u32, regrow: u32, pad2: u32, pad3: u32,
};
fn cidx(x: u32, y: u32, z: u32, gw: u32, gh: u32) -> u32 {
  return (z * gh + y) * gw + x;
}
fn hashu(x0: u32) -> u32 {
  var h = x0;
  h = h ^ (h >> 16u); h = h * 0x7feb352du;
  h = h ^ (h >> 15u); h = h * 0x846ca68bu;
  h = h ^ (h >> 16u);
  return h;
}
/* order-preserving float -> uint (handles sign) */
fn ordf(f: f32) -> u32 {
  let b = bitcast<u32>(f);
  if ((b & 0x80000000u) == 0u) { return b | 0x80000000u; }
  return ~b;
}
/* value-noise ridge - MUST match the render terrain exactly */
fn sh21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q = q + dot(q, q + 33.33);
  return fract(q.x * q.y);
}
fn svnoise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = sh21(i);                   let b = sh21(i + vec2f(1.0, 0.0));
  let c = sh21(i + vec2f(0.0, 1.0)); let d = sh21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}
fn sfbm(p0: vec2f) -> f32 {
  var p = p0; var a = 0.5; var v = 0.0;
  for (var k = 0; k < 5; k = k + 1) {
    v = v + a * svnoise(p);
    p = p * 2.03 + vec2f(17.1, 9.3);
    a = a * 0.5;
  }
  return v;
}
/* first lattice row (y grows downward) belonging to the terrain electrode */
fn terrainRow(x: u32, z: u32, gw: u32, gd: u32, gh: u32, bs: f32) -> u32 {
  let xn = (f32(x) + 0.5) / f32(gw);
  let zn = (f32(z) + 0.5) / f32(gd);
  let hy = 0.905 + sfbm(vec2f(xn * 6.0 + bs * 31.0, zn * 6.0 + bs * 17.0)) * 0.055;
  var row = min(u32(hy * f32(gh)), gh - 1u);
  /* the mast: a ~370 m grounded spike at a fixed spot. Nothing anywhere
     says "strike the mast" - it is just part of the phi=1 electrode, and
     the Laplace field crowds around anything sharp and elevated. The
     lightning-rod effect has to EMERGE, or the physics is wrong. */
  let td = length(vec2f(xn - 0.31, zn - 0.62)) * f32(gw);
  if (td < 2.2) {
    let boost = u32(f32(gh) * 0.080 * clamp((2.2 - td) / 1.3, 0.0, 1.0));
    row = row - min(boost, row - 2u);
  }
  return row;
}
