@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phi: array<f32>;
@group(0) @binding(2) var<storage, read> flags: array<u32>;
@group(0) @binding(3) var<storage, read_write> sel: Sel;
@group(0) @binding(4) var<storage, read_write> upSel: Sel;
@group(0) @binding(5) var<storage, read> terrain: array<u32>;
@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  if (u.upOn == 0u) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // junction made: freeze
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  let f = flags[i];
  if ((f & 5u) != 0u) { return; }                      // already in a tree
  let ty = terrain[gid.z * u.gw + gid.x];
  if (gid.y >= ty) { return; }                         // inside the rock
  var cand = (f & 8u) == 8u;                           // marked ground frontier
  if (!cand && gid.y * 4u >= u.gh * 3u) {              // low band: terrain surface
    cand = gid.y + 1u >= ty;
  }
  if (!cand) { return; }
  let w = 1.0 - phi[i];                                // field toward the leader
  let key = gumbelKey(i, u.eta, u.seed, upSel.stepc, w);
  atomicMax(&upSel.key, ordf(key));
}
