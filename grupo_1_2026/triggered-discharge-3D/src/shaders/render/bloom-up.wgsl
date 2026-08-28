@group(0) @binding(0) var smp: sampler;
@group(0) @binding(1) var src: texture_2d<f32>;
@fragment
fn fmain(@location(0) uv: vec2f) -> @location(0) vec4f {
  let ts = 1.0 / vec2f(textureDimensions(src));
  var c = textureSample(src, smp, uv + ts * vec2f(-1.0,  0.0)) * 2.0;
  c = c + textureSample(src, smp, uv + ts * vec2f( 1.0,  0.0)) * 2.0;
  c = c + textureSample(src, smp, uv + ts * vec2f( 0.0, -1.0)) * 2.0;
  c = c + textureSample(src, smp, uv + ts * vec2f( 0.0,  1.0)) * 2.0;
  c = c + textureSample(src, smp, uv + ts * vec2f(-1.0, -1.0));
  c = c + textureSample(src, smp, uv + ts * vec2f( 1.0, -1.0));
  c = c + textureSample(src, smp, uv + ts * vec2f(-1.0,  1.0));
  c = c + textureSample(src, smp, uv + ts * vec2f( 1.0,  1.0));
  return c / 12.0;
}
