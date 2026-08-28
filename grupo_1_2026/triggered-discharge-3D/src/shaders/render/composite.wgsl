@group(0) @binding(0) var<uniform> r: RenU;
@group(0) @binding(1) var smp: sampler;
@group(0) @binding(2) var sceneTex: texture_2d<f32>;
@group(0) @binding(3) var bloomTex: texture_2d<f32>;

fn agx(cIn: vec3f) -> vec3f {
  let M = mat3x3f(
    vec3f(0.842479062253094, 0.0423282422610123, 0.0423756549057051),
    vec3f(0.0784335999999992, 0.878468636469772, 0.0784336),
    vec3f(0.0792237451477643, 0.0791661274605434, 0.879142973793104));
  let Mi = mat3x3f(
    vec3f(1.19687900512017, -0.0528968517574562, -0.0529716355144438),
    vec3f(-0.0980208811401368, 1.15190312990417, -0.0980434501171241),
    vec3f(-0.0990297440797205, -0.0989611768448433, 1.15107367264116));
  var v = M * max(cIn, vec3f(1e-6));
  v = clamp((log2(v) + 12.47393) / 16.5, vec3f(0.0), vec3f(1.0));
  let x2 = v * v; let x4 = x2 * x2;
  v = 15.5 * x4 * x2 - 40.14 * x4 * v + 31.96 * x4
    - 6.868 * x2 * v + 0.4298 * x2 + 0.1191 * v - vec3f(0.00232);
  return clamp(Mi * v, vec3f(0.0), vec3f(1.0));
}

@fragment
fn fmain(@location(0) uv: vec2f) -> @location(0) vec4f {
  let off = (uv - 0.5) * r.misc1.w * clamp(r.strike.w * 0.06, 0.0, 1.0);
  let sr = textureSample(sceneTex, smp, uv + off).r;
  let sg = textureSample(sceneTex, smp, uv).g;
  let sb = textureSample(sceneTex, smp, uv - off).b;
  let bloom = textureSample(bloomTex, smp, uv).rgb;
  var hdr = vec3f(sr, sg, sb) + bloom * r.misc1.z;
  hdr = hdr * r.misc0.w;
  var col = agx(hdr);
  let q = uv - 0.5;
  col = col * (1.0 - dot(q, q) * 0.55);
  col = col + (h21(uv * r.res.xy + fract(r.misc0.x) * 41.7) - 0.5) * r.misc1.y;
  return vec4f(max(col, vec3f(0.0)), 1.0);
}
