fn gumbelKey(i: u32, eta: f32, seed: u32, stepc: u32, phi: f32) -> f32 {
  let rnd = hashu(i ^ hashu(stepc ^ hashu(seed)));
  let un  = (f32(rnd & 0x00ffffffu) + 0.5) / 16777216.0;
  let g   = -log(-log(un));
  return eta * log(max(phi, 1e-7)) + g;
}
