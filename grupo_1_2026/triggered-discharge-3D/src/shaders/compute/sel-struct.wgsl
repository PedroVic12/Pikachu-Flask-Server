struct Sel {
  key:    atomic<u32>,
  claim:  atomic<u32>,
  stepc:  u32,
  strike: atomic<u32>,
  sidx:   u32,           // cloud-side junction cell
  gidx:   u32,           // ground-side junction cell (0xffffffff = bare terrain)
  deepY:  atomic<u32>,   // deepest leader row so far (for striking distance)
  pad:    u32,
};
