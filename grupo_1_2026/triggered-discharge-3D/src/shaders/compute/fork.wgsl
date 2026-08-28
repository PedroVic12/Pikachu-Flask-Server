@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> flags: array<u32>;
@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  var f = flags[i] & ~(2u | 8u);                       // wipe both frontiers
  if ((f & 5u) == 0u) {                                // empty air only
    let fx = u.forkIdx % u.gw;
    let fy = (u.forkIdx / u.gw) % u.gh;
    let fz = u.forkIdx / (u.gw * u.gh);
    let dx = abs(i32(gid.x) - i32(fx));
    let dy = abs(i32(gid.y) - i32(fy));
    let dz = abs(i32(gid.z) - i32(fz));
    if (max(dx, max(dy, dz)) == 1) { f = f | 2u; }     // 26-hood of the fork
  }
  flags[i] = f;
}
