/* ----------------------------------------------------------------
   Device, buffers, textures, pipelines, bind groups.

   These are exported as `let` on purpose: ES module bindings are
   live, so every other module sees the handle the moment init() or
   resize() assigns it, without passing a context object around.
   Only this file writes them.
   ---------------------------------------------------------------- */

import { $, canvas } from "./dom.js";
import { GD, GW, LIST_CAP, N } from "../config.js";
import { frame } from "./frame.js";
import { newBolt } from "../sim/bolt.js";
import { wgslClear, wgslDown, wgslDownFirst, wgslFinal, wgslFork, wgslGrowReset, wgslGrowResolve, wgslGrowSelect, wgslJacobi, wgslResidual, wgslSky, wgslSplat, wgslTerrain, wgslUp, wgslUpResolve, wgslUpSelect } from "../shaders/index.js";

export let device, ctx, format;
export let simUBuf, renUBuf, resBuf, resStage;
export let phiA,
  phiB,
  flagsBuf,
  addedTBuf,
  parentBuf,
  pathPosBuf,
  terrainBuf,
  listBuf,
  selBuf,
  upSelBuf,
  indirectBuf;
export let selStage, parentStage, flagsStage;
export let plClear,
  plJac,
  plReset,
  plSelect,
  plResolve,
  plUpSelect,
  plUpResolve,
  plResid,
  plFork;
export let bgClear,
  bgJacAB,
  bgJacBA,
  bgReset,
  bgSelect,
  bgResolve,
  bgUpReset,
  bgUpSelect,
  bgUpResolve,
  bgResid,
  bgFork;
export let plSky, plTerrain, plSplat, plDownFirst, plDown, plUp, plFinal;
export let bgSky,
  bgTerrain,
  bgSplat,
  bgDown = [],
  bgUp = [],
  bgFinal;
export let sceneTex,
  sceneView,
  depthTex,
  depthView,
  bloomTex = [],
  bloomView = [];
export let sampler;
export const BLOOM_LEVELS = 5;


export async function init() {
  if (!navigator.gpu) return fail();
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return fail();
  device = await adapter.requestDevice();
  device.lost.then(() => fail());
  device.addEventListener?.("uncapturederror", (e) =>
    console.error("[webgpu]", e.error?.message || e),
  );
  ctx = canvas.getContext("webgpu");
  format = navigator.gpu.getPreferredCanvasFormat();

  const S = GPUBufferUsage.STORAGE,
    C = GPUBufferUsage.COPY_DST,
    R = GPUBufferUsage.COPY_SRC;
  simUBuf = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | C,
  });
  renUBuf = device.createBuffer({
    size: 304,
    usage: GPUBufferUsage.UNIFORM | C,
  });
  phiA = device.createBuffer({ size: N * 4, usage: S });
  phiB = device.createBuffer({ size: N * 4, usage: S });
  flagsBuf = device.createBuffer({ size: N * 4, usage: S | R }); // R: fractal readback
  addedTBuf = device.createBuffer({ size: N * 4, usage: S });
  parentBuf = device.createBuffer({ size: N * 4, usage: S | R });
  pathPosBuf = device.createBuffer({ size: N * 4, usage: S | C });
  terrainBuf = device.createBuffer({ size: GW * GD * 4, usage: S });
  listBuf = device.createBuffer({
    size: 16 + LIST_CAP * 4,
    usage: S | C | R,
  });
  selBuf = device.createBuffer({ size: 32, usage: S | C | R });
  upSelBuf = device.createBuffer({ size: 32, usage: S | C });
  indirectBuf = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.INDIRECT | C,
  });
  selStage = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.MAP_READ | C,
  });
  resBuf = device.createBuffer({ size: 16, usage: S | C | R }); // R: residual readback
  resStage = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.MAP_READ | C,
  });
  parentStage = device.createBuffer({
    size: N * 4,
    usage: GPUBufferUsage.MAP_READ | C,
  });
  flagsStage = device.createBuffer({
    size: N * 4,
    usage: GPUBufferUsage.MAP_READ | C,
  });
  device.queue.writeBuffer(indirectBuf, 0, new Uint32Array([6, 0, 0, 0]));

  const cp = (code) =>
    device.createComputePipeline({
      layout: "auto",
      compute: {
        module: device.createShaderModule({ code }),
        entryPoint: "main",
      },
    });
  plClear = cp(wgslClear);
  plJac = cp(wgslJacobi);
  plReset = cp(wgslGrowReset);
  plSelect = cp(wgslGrowSelect);
  plResolve = cp(wgslGrowResolve);
  plUpSelect = cp(wgslUpSelect);
  plUpResolve = cp(wgslUpResolve);
  plResid = cp(wgslResidual);
  plFork = cp(wgslFork);

  const bg = (pl, bufs) =>
    device.createBindGroup({
      layout: pl.getBindGroupLayout(0),
      entries: bufs.map((b, i) => ({
        binding: i,
        resource: { buffer: b },
      })),
    });
  bgClear = bg(plClear, [
    simUBuf,
    phiA,
    phiB,
    flagsBuf,
    addedTBuf,
    parentBuf,
    pathPosBuf,
    terrainBuf,
    listBuf,
  ]);
  bgJacAB = bg(plJac, [simUBuf, phiA, phiB, flagsBuf, terrainBuf]);
  bgJacBA = bg(plJac, [simUBuf, phiB, phiA, flagsBuf, terrainBuf]);
  bgReset = bg(plReset, [selBuf]);
  bgSelect = bg(plSelect, [simUBuf, phiA, flagsBuf, selBuf, terrainBuf]);
  bgResolve = bg(plResolve, [
    simUBuf,
    phiA,
    phiB,
    flagsBuf,
    addedTBuf,
    parentBuf,
    selBuf,
    terrainBuf,
    listBuf,
  ]);
  bgUpReset = bg(plReset, [upSelBuf]);
  bgResid = bg(plResid, [simUBuf, phiA, flagsBuf, terrainBuf, resBuf]);
  bgFork = bg(plFork, [simUBuf, flagsBuf]);
  bgUpSelect = bg(plUpSelect, [
    simUBuf,
    phiA,
    flagsBuf,
    selBuf,
    upSelBuf,
    terrainBuf,
  ]);
  bgUpResolve = bg(plUpResolve, [
    simUBuf,
    phiA,
    flagsBuf,
    addedTBuf,
    parentBuf,
    selBuf,
    upSelBuf,
    terrainBuf,
    listBuf,
  ]);

  sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const shader = (code) => device.createShaderModule({ code });
  const DEPTH = "depth24plus";
  plSky = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader(wgslSky), entryPoint: "vmain" },
    fragment: {
      module: shader(wgslSky),
      entryPoint: "fmain",
      targets: [{ format: "rgba16float" }],
    },
    primitive: { topology: "triangle-list" },
    depthStencil: {
      format: DEPTH,
      depthWriteEnabled: false,
      depthCompare: "always",
    },
  });
  plTerrain = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader(wgslTerrain), entryPoint: "vmain" },
    fragment: {
      module: shader(wgslTerrain),
      entryPoint: "fmain",
      targets: [{ format: "rgba16float" }],
    },
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: {
      format: DEPTH,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });
  plSplat = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader(wgslSplat), entryPoint: "vmain" },
    fragment: {
      module: shader(wgslSplat),
      entryPoint: "fmain",
      targets: [
        {
          format: "rgba16float",
          blend: {
            color: {
              srcFactor: "one",
              dstFactor: "one",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one",
              operation: "add",
            },
          },
        },
      ],
    },
    primitive: { topology: "triangle-list" },
    depthStencil: {
      format: DEPTH,
      depthWriteEnabled: false,
      depthCompare: "less",
    },
  });
  const rp2 = (code, blendAdd) =>
    device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader(code), entryPoint: "vmain" },
      fragment: {
        module: shader(code),
        entryPoint: "fmain",
        targets: [
          {
            format: "rgba16float",
            blend: blendAdd
              ? {
                  color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                  },
                  alpha: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                  },
                }
              : undefined,
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    });
  plDownFirst = rp2(wgslDownFirst, false);
  plDown = rp2(wgslDown, false);
  plUp = rp2(wgslUp, true);
  plFinal = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader(wgslFinal), entryPoint: "vmain" },
    fragment: {
      module: shader(wgslFinal),
      entryPoint: "fmain",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  bgSky = device.createBindGroup({
    layout: plSky.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: renUBuf } }],
  });
  bgTerrain = device.createBindGroup({
    layout: plTerrain.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: renUBuf } },
      { binding: 1, resource: { buffer: terrainBuf } },
    ],
  });
  bgSplat = device.createBindGroup({
    layout: plSplat.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: renUBuf } },
      { binding: 1, resource: { buffer: listBuf } },
      { binding: 2, resource: { buffer: addedTBuf } },
      { binding: 3, resource: { buffer: pathPosBuf } },
      { binding: 4, resource: { buffer: parentBuf } },
      { binding: 5, resource: { buffer: flagsBuf } },
    ],
  });

  addEventListener("resize", resize);
  resize();
  newBolt();
  requestAnimationFrame(frame);
}
export function fail() {
  $("nogpu").classList.add("show");
}

export function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(8, Math.floor(innerWidth * dpr));
  const h = Math.max(8, Math.floor(innerHeight * dpr));
  canvas.width = w;
  canvas.height = h;
  ctx.configure({ device, format, alphaMode: "opaque" });

  sceneTex?.destroy();
  depthTex?.destroy();
  bloomTex.forEach((t) => t.destroy());
  bloomTex = [];
  bloomView = [];
  const usage =
    GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING;
  sceneTex = device.createTexture({
    size: [w, h],
    format: "rgba16float",
    usage,
  });
  sceneView = sceneTex.createView();
  depthTex = device.createTexture({
    size: [w, h],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  depthView = depthTex.createView();
  for (let i = 0; i < BLOOM_LEVELS; i++) {
    const t = device.createTexture({
      size: [Math.max(8, w >> (i + 1)), Math.max(8, h >> (i + 1))],
      format: "rgba16float",
      usage,
    });
    bloomTex.push(t);
    bloomView.push(t.createView());
  }
  bgDown = [];
  bgUp = [];
  for (let i = 0; i < BLOOM_LEVELS; i++) {
    bgDown.push(
      device.createBindGroup({
        layout: (i === 0 ? plDownFirst : plDown).getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          {
            binding: 1,
            resource: i === 0 ? sceneView : bloomView[i - 1],
          },
        ],
      }),
    );
    bgUp.push(
      device.createBindGroup({
        layout: plUp.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: bloomView[i] },
        ],
      }),
    );
  }
  bgFinal = device.createBindGroup({
    layout: plFinal.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: renUBuf } },
      { binding: 1, resource: sampler },
      { binding: 2, resource: sceneView },
      { binding: 3, resource: bloomView[0] },
    ],
  });
}
