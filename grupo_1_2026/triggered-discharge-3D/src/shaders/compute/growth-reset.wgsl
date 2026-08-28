@group(0) @binding(0) var<storage, read_write> sel: Sel;
@compute @workgroup_size(1)
fn main() {
  atomicStore(&sel.key, 0u);
  atomicStore(&sel.claim, 0u);
  sel.stepc = sel.stepc + 1u;
}
