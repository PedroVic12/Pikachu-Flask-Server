struct List { count: u32, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> r: RenU;
@group(0) @binding(1) var<storage, read> list: List;
@group(0) @binding(2) var<storage, read> addedT: array<f32>;
@group(0) @binding(3) var<storage, read> pathPos: array<f32>;
@group(0) @binding(4) var<storage, read> parent: array<u32>;
@group(0) @binding(5) var<storage, read> flags: array<u32>;
/* Horton-like scaling: segment strength grows sublinearly with the
   charge it feeds (descendant count), clamped for the trunk */
fn feedFactor(i: u32) -> f32 {
  return min(pow(f32(1u + (flags[i] >> 4u)), 0.30), 8.0);
}

fn cellLum(i: u32, altM: f32) -> f32 {
  let age = r.misc0.x - addedT[i];
  let ff = feedFactor(i);
  /* stepped / dart leader: the trunk carries the summed branch currents
     and glows accordingly; twigs stay faint. Tips flicker as fresh
     steps re-illuminate the advancing region. */
  let flick = 0.65 + 0.70 * h21(vec2f(f32(i % 2048u), floor(r.misc0.x * 24.0)));
  var v = r.misc0.y * (0.30 * ff + 6.0 * flick * exp(-age * 5.5));
  let pp = pathPos[i];
  let sType = r.misc2.x;
  if (sType == 1.0) {                     /* ---- return stroke ---- */
    if (pp >= 0.0) {
      let z  = pp * r.misc2.z;            // true arc length above ground
      let iz = baseCurrent(r, r.misc2.y - z / V_RS) * exp(-z / LAMBDA);
      v = v + lumOfCurrent(iz);
    } else if ((flags[i] & 1u) == 1u && r.misc0.z > 0.5) {
      /* branch components lit by the retarded front at their altitude -
         a branch flashes with the charge it stored, so heavy limbs pop
         and twigs barely answer */
      let ib = baseCurrent(r, r.misc2.y - altM / V_RS) * exp(-altM / LAMBDA);
      v = v + (0.045 + 0.036 * ff) * lumOfCurrent(ib);
    } else if ((flags[i] & 4u) == 4u) {
      /* the losing upward leaders: frozen mid-air, lit by the flash */
      v = v + 0.05 * lumOfCurrent(baseCurrent(r, r.misc2.y));
    }
  } else if (sType == 2.0 && pp >= 0.0) { /* ---- dart leader ---- */
    v = v + select(0.0, 4.5, pp >= r.misc2.w);
    v = v + 30.0 * exp(-abs(pp - r.misc2.w) * 26.0);
  } else if (sType == 3.0 && pp >= 0.0) { /* ---- continuing current ---- */
    v = v + r.misc2.w;
  } else if (sType == 4.0 && pp <= -2.0) {
    /* recoil leader: a pulse racing back down a decayed branch.
       pp encodes chain id + position: pp = -(2 + m + 0.92*frac) */
    let t = -pp - 2.0;
    let m = floor(t);
    if (m == r.misc2.w) {
      let frac  = (t - m) / 0.92;                 // 1 at the dead tip, 0 at trunk
      let front = r.misc2.y;                      // sweeps 1 -> 0
      v = v + 24.0 * exp(-abs(frac - front) * 16.0);
      v = v + select(0.0, 2.2, frac > front);     // ionized wake behind the pulse
    }
  }
  return v;
}

fn cellWorld(idx: u32) -> vec3f {
  let gw = u32(r.dims.x); let gh = u32(r.dims.y);
  let x = idx % gw;
  let y = (idx / gw) % gh;
  let z = idx / (gw * gh);
  return vec3f((f32(x) + 0.5 - r.dims.x * 0.5) * r.dims.w,
               (r.dims.y - 1.0 - f32(y)) * r.dims.w,
               (f32(z) + 0.5 - r.dims.z * 0.5) * r.dims.w);
}

struct SOut {
  @builtin(position) pos: vec4f,
  @location(0) q: vec2f,
  @location(1) lum: f32,
};
/* each channel cell is drawn as a camera-facing RIBBON to its parent,
   so the tortuous 26-connected path renders as one continuous filament */
@vertex
fn vmain(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> SOut {
  var corners = array<vec2f,6>(
    vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0),
    vec2f(1.0,-1.0),  vec2f(1.0,1.0),  vec2f(-1.0,1.0));
  let idx = list.items[ii];
  var p0 = cellWorld(idx);
  let par = parent[idx];
  var p1 = p0 + vec3f(0.0, r.dims.w * 0.6, 0.0);
  if (par != 0xffffffffu) { p1 = cellWorld(par); }
  /* ribbon lightning: wind drags the re-used channel between strokes.
     Offset grows with altitude (wind is stronger aloft). */
  if (pathPos[idx] >= 0.0) {
    let wf = 0.35 + 0.65 * clamp(p0.y / r.res.z, 0.0, 1.0);
    p0 = p0 + vec3f(r.ha.w, 0.0, r.hb.w) * wf;
  }
  if (par != 0xffffffffu && pathPos[par] >= 0.0) {
    let wf2 = 0.35 + 0.65 * clamp(p1.y / r.res.z, 0.0, 1.0);
    p1 = p1 + vec3f(r.ha.w, 0.0, r.hb.w) * wf2;
  }
  let mid = (p0 + p1) * 0.5;
  let lum = cellLum(idx, mid.y);
  /* channel radius ~ i^(1/3): Braginskii shock-expansion exponent -
     the mapping to PIXELS below is a rendering approximation */
  /* width: charge-fed trunk is fat, twigs are threads; the return-stroke
     term still swells the whole conducting path with current^(1/3) */
  let w = r.dims.w * (0.10 + 0.075 * feedFactor(idx)
                      + 0.95 * pow(clamp(lum / 96.0, 0.0, 4.0), 0.33));
  var axis = p1 - p0;
  let L = max(length(axis), 1e-3);
  axis = axis / L;
  let vdir = normalize(r.camPos.xyz - mid);
  var side = cross(axis, vdir);
  let sl = length(side);
  side = select(side / max(sl, 1e-4), r.camRight.xyz, sl < 1e-3);
  let c = corners[vi];
  var o: SOut;
  o.q = c; o.lum = lum;
  /* half-length + w caps so consecutive segments overlap at joints */
  let ep = mid + axis * c.x * (L * 0.5 + w) + side * c.y * w;
  o.pos = r.viewProj * vec4f(ep, 1.0);
  return o;
}
@fragment
fn fmain(@location(0) q: vec2f, @location(1) lum: f32) -> @location(0) vec4f {
  let fall = exp(-q.y * q.y * 4.2);
  /* ~30 000 K plasma: white core, N2/N2+ violet-blue fringe */
  let fringe = vec3f(0.46, 0.36, 1.00);
  let core   = vec3f(1.00, 0.97, 1.00);
  let col = mix(fringe, core, clamp(lum * 0.012, 0.0, 1.0));
  return vec4f(col * lum * fall * 0.09, 1.0);
}
