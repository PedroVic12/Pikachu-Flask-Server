@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phiIn: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiOut: array<f32>;
@group(0) @binding(3) var<storage, read> flags: array<u32>;
@group(0) @binding(4) var<storage, read> terrain: array<u32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh || gid.z >= u.gd) { return; }
  let i = cidx(gid.x, gid.y, gid.z, u.gw, u.gh);
  if (gid.y >= terrain[gid.z * u.gw + gid.x]) { phiOut[i] = 1.0; return; } // terrain electrode
  let fj = flags[i];
  if ((fj & 1u) == 1u) { phiOut[i] = 0.0; return; }   // cloud tree: cloud potential
  if ((fj & 4u) == 4u) { phiOut[i] = 1.0; return; }   // ground tree: ground potential
  /* Neumann sides & top via clamped sampling; 6-neighbour Laplacian */
  let xl = select(gid.x - 1u, 0u,        gid.x == 0u);
  let xr = select(gid.x + 1u, u.gw - 1u, gid.x == u.gw - 1u);
  let yu = select(gid.y - 1u, 0u,        gid.y == 0u);
  let yd = gid.y + 1u;
  let zb = select(gid.z - 1u, 0u,        gid.z == 0u);
  let zf = select(gid.z + 1u, u.gd - 1u, gid.z == u.gd - 1u);
  phiOut[i] = ( phiIn[cidx(xl,gid.y,gid.z,u.gw,u.gh)] + phiIn[cidx(xr,gid.y,gid.z,u.gw,u.gh)]
              + phiIn[cidx(gid.x,yu,gid.z,u.gw,u.gh)] + phiIn[cidx(gid.x,yd,gid.z,u.gw,u.gh)]
              + phiIn[cidx(gid.x,gid.y,zb,u.gw,u.gh)] + phiIn[cidx(gid.x,gid.y,zf,u.gw,u.gh)]
              ) / 6.0;
}
