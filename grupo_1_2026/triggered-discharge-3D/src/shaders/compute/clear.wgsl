struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiB: array<f32>;
@group(0) @binding(3) var<storage, read_write> flags: array<u32>;   // bit0 channel, bit1 frontier
@group(0) @binding(4) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(5) var<storage, read_write> parent: array<u32>;
@group(0) @binding(6) var<storage, read_write> pathPos: array<f32>;
@group(0) @binding(7) var<storage, read_write> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  /* cache the terrain electrode heightfield once per bolt */
  if (gid.y == 0u) {
    terrain[gid.z * u.gw + gid.x] = terrainRow(gid.x, gid.z, u.gw, u.gd, u.gh, u.bs);
  }
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  var phi = f32(gid.y) / f32(u.gh - 1u);      // linear warm start
  var st  = 0u;
  var at  = -1e4;
  var par = 0xffffffffu;
  /* seed: short stalactite hanging from the cloud base */
  if (gid.x == u.seedX && gid.z == u.seedZ && gid.y < 5u) {
    st = 1u; phi = 0.0; at = u.time;
    if (gid.y > 0u) { par = cidx(gid.x, gid.y - 1u, gid.z, u.gw, u.gh); }
    let slot = atomicAdd(&list.count, 1u);
    if (slot < list.cap) { list.items[slot] = i; }
  }
  /* deterministic initial candidate shell around the seed column */
  var cd = 0u;
  let adjX = (gid.x + 1u >= u.seedX) && (gid.x <= u.seedX + 1u);
  let adjZ = (gid.z + 1u >= u.seedZ) && (gid.z <= u.seedZ + 1u);
  if (st == 0u && adjX && adjZ && gid.y < 6u) { cd = 1u; }
  phiA[i] = phi; phiB[i] = phi;
  flags[i] = st | (cd << 1u); addedT[i] = at; parent[i] = par;
  pathPos[i] = -1.0;
}
