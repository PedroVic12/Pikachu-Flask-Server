struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> flags: array<u32>;
@group(0) @binding(3) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(4) var<storage, read_write> parent: array<u32>;
@group(0) @binding(5) var<storage, read_write> sel: Sel;
@group(0) @binding(6) var<storage, read_write> upSel: Sel;
@group(0) @binding(7) var<storage, read> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;
@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  if (u.upOn == 0u) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // junction made: freeze
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  let f = flags[i];
  if ((f & 5u) != 0u) { return; }
  let ty = terrain[gid.z * u.gw + gid.x];
  if (gid.y >= ty) { return; }
  var cand = (f & 8u) == 8u;
  if (!cand && gid.y * 4u >= u.gh * 3u) { cand = gid.y + 1u >= ty; }
  if (!cand) { return; }
  let w = 1.0 - phiA[i];
  let key = gumbelKey(i, u.eta, u.seed, upSel.stepc, w);
  if (ordf(key) != atomicLoad(&upSel.key)) { return; }
  if (atomicExchange(&upSel.claim, 1u) != 0u) { return; }   // one winner

  /* attach to the newest ground-tree neighbour, mark the frontier,
     and check for contact with the cloud tree - the junction */
  var bestT = -1e9; var par = 0xffffffffu;
  for (var dz = -1i; dz <= 1i; dz = dz + 1i) {
    for (var dy = -1i; dy <= 1i; dy = dy + 1i) {
      for (var dx = -1i; dx <= 1i; dx = dx + 1i) {
        if (dx == 0i && dy == 0i && dz == 0i) { continue; }
        let nx = i32(gid.x) + dx; let ny = i32(gid.y) + dy; let nz = i32(gid.z) + dz;
        if (nx < 0i || ny < 0i || nz < 0i ||
            nx >= i32(u.gw) || ny >= i32(u.gh) || nz >= i32(u.gd)) { continue; }
        let ni = cidx(u32(nx), u32(ny), u32(nz), u.gw, u.gh);
        let fn2 = flags[ni];
        if ((fn2 & 4u) == 4u) {
          if (addedT[ni] > bestT) { bestT = addedT[ni]; par = ni; }
        } else if ((fn2 & 1u) == 1u) {
          sel.sidx = ni;                               // cloud-side of the junction
          sel.gidx = i;                                // ground-side of the junction
          atomicStore(&sel.strike, 1u);
        } else {
          flags[ni] = flags[ni] | 8u;                  // extend the ground frontier
        }
      }
    }
  }
  flags[i]  = 4u;                                      // joins the ground tree
  addedT[i] = u.time;
  parent[i] = par;                                     // 0xffffffff = rooted in rock
  var anc = par;
  var g = 0u;
  loop {
    if (anc == 0xffffffffu || g > 4096u) { break; }
    flags[anc] = flags[anc] + 16u;
    anc = parent[anc];
    g = g + 1u;
  }
  let slot = atomicAdd(&list.count, 1u);
  if (slot < list.cap) { list.items[slot] = i; }
}
