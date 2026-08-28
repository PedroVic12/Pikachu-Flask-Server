# TRIGGERED DISCHARGE
A real-time 3-D lightning simulation running entirely on the GPU.

It combines:

- a Laplace equation solver for the electric field
- dielectric breakdown growth for branching leaders
- a Heidler current waveform for the return stroke
- MTLE current decay along the lightning channel
- volumetric rendering, bloom and procedural thunder

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit |
| Scroll / pinch | Zoom |
| Click ground | Trigger a strike |

Sliders cover branching exponent, peak current, time dilation, exposure and bloom.


**[Live demo →](https://diluuuu10.github.io/triggered-discharge/)**

## Layout

```
src/
  core/      device, buffers, pipelines, uniforms, frame loop
  physics/   Heidler current waveform, mat4 helpers
  sim/       bolt state machine, clock, fractal dimension
  shaders/
    compute/ Laplace solve (Jacobi + residual), growth select/resolve, forking
    render/  channel, terrain, sky, bloom chain, composite
  ui/        control panel, orbit/pinch/click input
  audio/     thunder synthesis
```

## Running locally

```sh
npm install
npm run dev
```

## Building

```sh
npm run build:bundle
```

`vite-plugin-singlefile` inlines the shaders, CSS and JS back into one
`dist/index.html` you can drop anywhere or record from. It is not minified — the
shipped file reads like the source did.
