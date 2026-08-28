@group(0) @binding(0) var<uniform> r: RenU;
@fragment
fn fmain(@location(0) uv: vec2f) -> @location(0) vec4f {
  let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  var p0 = r.invVP * vec4f(ndc, 0.0, 1.0);
  var p1 = r.invVP * vec4f(ndc, 1.0, 1.0);
  let ro = p0.xyz / p0.w;
  let rd = normalize(p1.xyz / p1.w - ro);

  let up = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
  var col = mix(vec3f(0.020, 0.024, 0.048), vec3f(0.008, 0.010, 0.024), pow(up, 0.8));

  /* stratiform deck just above cloud base (top of the lattice) */
  let cloudY = r.res.z * 1.03;
  if (rd.y > 0.002) {
    let t = (cloudY - ro.y) / rd.y;
    if (t > 0.0) {
      let hp = ro.xz + rd.xz * t;
      var cd = fbm(hp * 0.00045 + vec2f(r.misc1.x * 13.7, r.misc0.x * 0.004));
      cd = smoothstep(0.38, 0.80, cd);
      let dl = distance(hp, r.strike.xz);
      let cloudLight = r.strike.w / (dl * dl * 2.4e-5 + 0.6);
      let cc = vec3f(0.050, 0.056, 0.086) * (0.6 + 0.4 * cd)
             + vec3f(0.62, 0.58, 0.92) * cloudLight * cd;
      let horizonFade = smoothstep(0.002, 0.06, rd.y);
      col = mix(col, cc, cd * horizonFade);
    }
  }
  /* red sprite: a transient luminous event in the mesosphere, triggered
     by large (especially positive) strokes. Columnar filaments marched
     between two altitude planes above the cloud deck. */
  let sT = r.res.w;
  if (sT > 0.0 && sT < 1.0 && rd.y > 0.03) {
    let env = smoothstep(0.0, 0.06, sT) * (1.0 - smoothstep(0.25, 1.0, sT));
    let y1 = r.res.z * 1.7;  let y2 = r.res.z * 3.4;
    let t1 = (y1 - ro.y) / rd.y;  let t2 = (y2 - ro.y) / rd.y;
    if (t1 > 0.0 && env > 0.0) {
      var acc = 0.0;
      for (var k = 0; k < 8; k = k + 1) {
        let tt = mix(t1, t2, (f32(k) + 0.5) / 8.0);
        let p  = ro + rd * tt;
        let yf = (p.y - y1) / (y2 - y1);
        /* thin vertical columns, clustered above the strike */
        let coln = smoothstep(0.72, 0.92,
          vnoise(vec2f(p.x * 0.0016 + r.misc1.x * 47.0, p.z * 0.0016)));
        let spread = exp(-distance(p.xz, r.strike.xz) * 2.2e-4);
        acc = acc + coln * spread * (0.4 + 0.6 * yf);
      }
      let sc = mix(vec3f(0.45, 0.20, 1.00), vec3f(1.00, 0.13, 0.24),
                   clamp((rd.y * 6.0), 0.0, 1.0));
      col = col + sc * acc * env * 0.10;
    }
  }
  /* whole-sky fill during a flash */
  col = col + vec3f(0.050, 0.050, 0.080) * r.strike.w * 0.045;
  return vec4f(col, 1.0);
}
