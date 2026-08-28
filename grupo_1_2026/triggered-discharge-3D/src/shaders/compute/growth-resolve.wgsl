struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiB: array<f32>;
@group(0) @binding(3) var<storage, read_write> flags: array<u32>;
@group(0) @binding(4) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(5) var<storage, read_write> parent: array<u32>;
@group(0) @binding(6) var<storage, read_write> sel: Sel;
@group(0) @binding(7) var<storage, read> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;
@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // leader attached: freeze
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  if ((flags[i] & 7u) != 2u) { return; }               // cloud frontier, in no tree
  if (gid.y >= terrain[gid.z * u.gw + gid.x]) { return; }
  let key = gumbelKey(i, u.eta, u.seed, sel.stepc, phiA[i]);
  if (ordf(key) != atomicLoad(&sel.key)) { return; }
  if (atomicExchange(&sel.claim, 1u) != 0u) { return; } // exactly one winner

  /* attach to the most recently grown adjacent channel cell (the live tip)
     and mark the 26-neighbourhood as the new candidate frontier */
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
        if ((fn2 & 1u) == 1u) {
          if (addedT[ni] > bestT) { bestT = addedT[ni]; par = ni; }
        } else if ((fn2 & 4u) == 4u) {
          /* touched an upward connecting leader: the junction */
          sel.gidx = ni;
          atomicStore(&sel.strike, 1u);
        } else {
          flags[ni] = flags[ni] | 2u;                  // extend the cloud frontier
        }
      }
    }
  }
  flags[i]  = 1u;                                      // channel (frontier bit cleared)
  phiA[i]   = 0.0;
  phiB[i]   = 0.0;
  addedT[i] = u.time;
  parent[i] = par;
  /* leader current in a segment ~ charge fed downstream: credit every
     ancestor with this new cell (flags bits 2+ = descendant count).
     Trunk accumulates thousands; dead-end twigs stay at zero. */
  var anc = par;
  var g = 0u;
  loop {
    if (anc == 0xffffffffu || g > 4096u) { break; }
    flags[anc] = flags[anc] + 16u;       // feed lives in bits 4+ now
    anc = parent[anc];
    g = g + 1u;
  }
  sel.sidx  = i;
  atomicMax(&sel.deepY, gid.y);          // track the descending tip
  let slot = atomicAdd(&list.count, 1u);
  if (slot < list.cap) { list.items[slot] = i; }
  if (gid.y + 1u >= terrain[gid.z * u.gw + gid.x]) {
    sel.gidx = 0xffffffffu;                            // bare-terrain attachment
    atomicStore(&sel.strike, 1u);
  }
}
