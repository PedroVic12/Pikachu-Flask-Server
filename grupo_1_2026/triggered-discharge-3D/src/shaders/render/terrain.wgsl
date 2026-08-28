@group(0) @binding(0) var<uniform> r: RenU;
@group(0) @binding(1) var<storage, read> terrain: array<u32>;

fn tAlt(x: i32, z: i32) -> f32 {
  let gw = i32(r.dims.x); let gd = i32(r.dims.z);
  let cx = clamp(x, 0, gw - 1); let cz = clamp(z, 0, gd - 1);
  let row = f32(terrain[u32(cz) * u32(gw) + u32(cx)]);
  return (r.dims.y - 1.0 - row) * r.dims.w;          // world altitude, m
}
fn tPos(x: i32, z: i32) -> vec3f {
  let wx = (f32(x) - r.dims.x * 0.5) * r.dims.w;
  let wz = (f32(z) - r.dims.z * 0.5) * r.dims.w;
  return vec3f(wx, tAlt(x, z), wz);
}

struct TOut {
  @builtin(position) pos: vec4f,
  @location(0) wp: vec3f,
  @location(1) nrm: vec3f,
};
@vertex
fn vmain(@builtin(vertex_index) vi: u32) -> TOut {
  let gw = u32(r.dims.x); let gd = u32(r.dims.z);
  let q = vi / 6u; let c = vi % 6u;
  let qx = i32(q % (gw - 1u)); let qz = i32(q / (gw - 1u));
  var ox = 0i; var oz = 0i;
  switch (c) {
    case 1u: { ox = 1; }          case 2u: { oz = 1; }
    case 3u: { ox = 1; }          case 4u: { ox = 1; oz = 1; }
    case 5u: { oz = 1; }          default: {}
  }
  let x = qx + ox; let z = qz + oz;
  var o: TOut;
  o.wp  = tPos(x, z);
  let n = vec3f(tAlt(x - 1, z) - tAlt(x + 1, z), 2.0 * r.dims.w,
                tAlt(x, z - 1) - tAlt(x, z + 1));
  o.nrm = normalize(n);
  o.pos = r.viewProj * vec4f(o.wp, 1.0);
  return o;
}
@fragment
fn fmain(@location(0) wp: vec3f, @location(1) nrm: vec3f) -> @location(0) vec4f {
  let n = normalize(nrm);
  var col = vec3f(0.010, 0.011, 0.017) * (0.55 + 0.45 * n.y); // ambient sky
  /* flash: inverse-square point light at the strike attachment */
  let lp = r.strike.xyz + vec3f(0.0, 60.0, 0.0);
  let lv = lp - wp;
  let d2 = dot(lv, lv);
  let ndl = max(dot(n, lv / sqrt(max(d2, 1.0))), 0.0);
  col = col + vec3f(0.62, 0.58, 0.92) * r.strike.w * ndl * 5.2e4 / (d2 + 3.0e4);
  return vec4f(col, 1.0);
}
