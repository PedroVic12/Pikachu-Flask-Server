struct VOut { @builtin(position) pos: vec4f, @location(0) uv: vec2f };
@vertex
fn vmain(@builtin(vertex_index) vi: u32) -> VOut {
  var p = array<vec2f,3>(vec2f(-1.0,-1.0), vec2f(3.0,-1.0), vec2f(-1.0,3.0));
  var o: VOut;
  o.pos = vec4f(p[vi], 0.0, 1.0);
  o.uv  = p[vi] * vec2f(0.5, -0.5) + vec2f(0.5);
  return o;
}
