/* ----------------------------------------------------------------
   One frame: advance the clock, relax the field, grow the channel,
   draw sky -> terrain -> channel, bloom, composite, then service the
   async readbacks (selection, parents, flags, residual).
   ---------------------------------------------------------------- */

import { $, canvas } from "./dom.js";
import { CELL_M, GD, GH, GW, MOBILE, N, PHYS, TER_MIN } from "../config.js";
import { bgDown, bgFinal, bgFork, bgJacAB, bgJacBA, bgReset, bgResid, bgResolve, bgSelect, bgSky, bgSplat, bgTerrain, bgUp, bgUpReset, bgUpResolve, bgUpSelect, BLOOM_LEVELS, bloomView, ctx, depthView, device, flagsBuf, flagsStage, indirectBuf, listBuf, parentBuf, parentStage, plDown, plDownFirst, plFinal, plFork, plJac, plReset, plResid, plResolve, plSelect, plSky, plSplat, plTerrain, plUp, plUpResolve, plUpSelect, resBuf, resStage, sceneView, selBuf, selStage } from "./gpu.js";
import { bolt, rt, ui } from "./state.js";
import { fractalDim } from "../sim/fractal.js";
import { onStrike, tracePath } from "../sim/bolt.js";
import { updatePhase } from "../sim/clock.js";
import { writeRenU, writeSimU } from "./uniforms.js";

export function frame(tms) {
  requestAnimationFrame(frame);
  const t = tms / 1000;
  const dt = Math.min(0.05, Math.max(0.0001, t - rt.lastT));
  rt.lastT = t;

  updatePhase(dt);
  writeSimU();
  writeRenU(dt);

  let pollRes = false;
  const enc = device.createCommandEncoder();
  enc.copyBufferToBuffer(listBuf, 0, indirectBuf, 4, 4); // instance count

  if (
    (bolt.phase === "grow" || bolt.phase === "regrow") &&
    !ui.paused &&
    bolt.growSteps > 0
  ) {
    const p = enc.beginComputePass();
    const wx = Math.ceil(GW / 4),
      wy = Math.ceil(GH / 4),
      wz = Math.ceil(GD / 4);
    /* the field must be re-relaxed between growth steps: DBM branch
       suppression IS electrostatic screening, and a stale φ collapses
       the leader into a DLA bush. Even sweep counts keep φ in phiA. */
    const jac = (n) => {
      p.setPipeline(plJac);
      for (let i = 0; i < n; i++) {
        p.setBindGroup(0, i % 2 === 0 ? bgJacAB : bgJacBA);
        p.dispatchWorkgroups(wx, wy, wz);
      }
    };
    jac(rt.jacIters);
    /* residual probe every 10 frames: async, never stalls the pipe */
    if (rt.needFork) {
      rt.needFork = false;
      p.setPipeline(plFork);
      p.setBindGroup(0, bgFork);
      p.dispatchWorkgroups(wx, wy, wz);
    }
    if (rt.frameNo % 10 === 0 && !rt.resPending) {
      device.queue.writeBuffer(resBuf, 0, new Uint32Array(4));
      p.setPipeline(plResid);
      p.setBindGroup(0, bgResid);
      p.dispatchWorkgroups(wx, wy, wz);
      pollRes = true;
    }
    for (let k = 0; k < bolt.growSteps; k++) {
      p.setPipeline(plReset);
      p.setBindGroup(0, bgReset);
      p.dispatchWorkgroups(1);
      p.setPipeline(plSelect);
      p.setBindGroup(0, bgSelect);
      p.dispatchWorkgroups(wx, wy, wz);
      p.setPipeline(plResolve);
      p.setBindGroup(0, bgResolve);
      p.dispatchWorkgroups(wx, wy, wz);
      if (bolt.upOn) {
        /* the connecting-leader race: positive leaders climb from the ground */
        p.setPipeline(plReset);
        p.setBindGroup(0, bgUpReset);
        p.dispatchWorkgroups(1);
        p.setPipeline(plUpSelect);
        p.setBindGroup(0, bgUpSelect);
        p.dispatchWorkgroups(wx, wy, wz);
        p.setPipeline(plUpResolve);
        p.setBindGroup(0, bgUpResolve);
        p.dispatchWorkgroups(wx, wy, wz);
      }
      if (k + 1 < bolt.growSteps) jac(4);
    }
    p.end();
    bolt.cells += bolt.growSteps;
  }

  /* scene: sky -> terrain -> channel splats (one pass, shared depth) */
  const rp = enc.beginRenderPass({
    colorAttachments: [
      {
        view: sceneView,
        loadOp: "clear",
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthView,
      depthLoadOp: "clear",
      depthClearValue: 1,
      depthStoreOp: "store",
    },
  });
  rp.setPipeline(plSky);
  rp.setBindGroup(0, bgSky);
  rp.draw(3);
  rp.setPipeline(plTerrain);
  rp.setBindGroup(0, bgTerrain);
  rp.draw((GW - 1) * (GD - 1) * 6);
  rp.setPipeline(plSplat);
  rp.setBindGroup(0, bgSplat);
  rp.drawIndirect(indirectBuf, 0);
  rp.end();

  const post = (view, load, pl, bgr) => {
    const r = enc.beginRenderPass({
      colorAttachments: [
        {
          view,
          loadOp: load,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: "store",
        },
      ],
    });
    r.setPipeline(pl);
    r.setBindGroup(0, bgr);
    r.draw(3);
    r.end();
  };
  for (let i = 0; i < BLOOM_LEVELS; i++)
    post(
      bloomView[i],
      "clear",
      i === 0 ? plDownFirst : plDown,
      bgDown[i],
    );
  for (let i = BLOOM_LEVELS - 1; i > 0; i--)
    post(bloomView[i - 1], "load", plUp, bgUp[i]);
  post(ctx.getCurrentTexture().createView(), "clear", plFinal, bgFinal);

  let pollSel = false,
    pollPar = false;
  if (
    (bolt.phase === "grow" || bolt.phase === "regrow") &&
    !rt.selPending &&
    !ui.paused
  ) {
    enc.copyBufferToBuffer(selBuf, 0, selStage, 0, 32);
    pollSel = true;
  }
  if (rt.needParents && !rt.parentPending) {
    enc.copyBufferToBuffer(parentBuf, 0, parentStage, 0, N * 4);
    rt.needParents = false;
    pollPar = true;
  }
  if (pollRes) enc.copyBufferToBuffer(resBuf, 0, resStage, 0, 16);
  let pollFlags = false;
  if (rt.needFractal && !rt.flagsPending) {
    enc.copyBufferToBuffer(flagsBuf, 0, flagsStage, 0, N * 4);
    rt.needFractal = false;
    pollFlags = true;
  }
  device.queue.submit([enc.finish()]);

  if (rt.pngFlag) {
    rt.pngFlag = false;
    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `discharge_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
  if (pollSel) {
    rt.selPending = true;
    selStage
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const a = new Uint32Array(selStage.getMappedRange().slice(0));
        selStage.unmap();
        rt.selPending = false;
        const dCells = a[6] - bolt.deepY;
        const dT = bolt.tReal - bolt.deepT;
        if (
          (bolt.phase === "grow" || bolt.phase === "regrow") &&
          dT > 1e-7
        ) {
          const v = (Math.max(0, dCells) * CELL_M) / dT; // measured tip speed
          bolt.tipV = bolt.tipV * 0.6 + v * 0.4;
          const vT =
            bolt.phase === "regrow" ? PHYS.V_DSTEP : PHYS.V_LEADER;
          bolt.stepGain = Math.min(
            24,
            Math.max(
              1.5,
              bolt.tipV > 1e3
                ? bolt.stepGain * Math.pow(vT / bolt.tipV, 0.5)
                : bolt.stepGain * 1.15,
            ),
          ); // stalled tip: push harder
          $("rTip").textContent = (bolt.tipV / 1e5).toFixed(1) + "e5 m/s";
        }
        bolt.deepT = bolt.tReal;
        bolt.deepY = Math.max(bolt.deepY, a[6]);
        /* striking distance: d_s ~ 18 * I0^0.65 m - inside it, ground answers */
        const I0eff = ui.I0 * (ui.positive ? 2.2 : 1);
        const dS = 18 * Math.pow(I0eff, 0.65);
        if (
          !bolt.upOn &&
          (TER_MIN - bolt.deepY) * CELL_M < dS &&
          bolt.phase === "grow"
        ) {
          bolt.upOn = true;
          $("rPhase").textContent = "LEADERS CONNECTING";
        }
        if (a[3] === 1) onStrike(a[4], a[5]);
      })
      .catch(() => {
        rt.selPending = false;
      });
  }
  if (pollRes) {
    rt.resPending = true;
    resStage
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const b = new Uint32Array(resStage.getMappedRange().slice(0))[0];
        resStage.unmap();
        rt.resPending = false;
        /* invert ordf: top bit set means it was a positive float */
        rt.residNow = new Float32Array(
          new Uint32Array([b & 0x80000000 ? b ^ 0x80000000 : ~b >>> 0])
            .buffer,
        )[0];
        /* controller: iterate harder while stale, coast when settled */
        if (rt.residNow > 4e-3) rt.jacIters = Math.min(32, rt.jacIters + 4);
        else if (rt.residNow < 8e-4)
          rt.jacIters = Math.max(MOBILE ? 6 : 8, rt.jacIters - 2);
        $("rRes").textContent =
          rt.residNow.toExponential(1) + " · " + rt.jacIters + " it";
      })
      .catch(() => {
        rt.resPending = false;
      });
  }
  if (pollFlags) {
    rt.flagsPending = true;
    flagsStage
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const fl = new Uint32Array(flagsStage.getMappedRange().slice(0));
        flagsStage.unmap();
        rt.flagsPending = false;
        fractalDim(fl);
      })
      .catch(() => {
        rt.flagsPending = false;
      });
  }
  if (pollPar) {
    rt.parentPending = true;
    parentStage
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const parents = new Uint32Array(
          parentStage.getMappedRange().slice(0),
        );
        parentStage.unmap();
        rt.parentPending = false;
        tracePath(parents);
      })
      .catch(() => {
        rt.parentPending = false;
      });
  }

  /* ---------------- HUD ---------------- */
  if (++rt.frameNo % 3 === 0) {
    const tr = bolt.tReal;
    $("rTime").textContent =
      tr < 1e-3
        ? (tr * 1e6).toFixed(0) + " µs"
        : tr < 1
          ? (tr * 1e3).toFixed(1) + " ms"
          : tr.toFixed(2) + " s";
    $("rSlow").textContent =
      "× " + Math.round(bolt.slomoNow).toLocaleString();
    $("rAmp").textContent =
      bolt.env.curKA >= 10
        ? bolt.env.curKA.toFixed(0) + " kA"
        : bolt.env.curKA.toFixed(2) + " kA";
    if (bolt.thunderPerf > 0) {
      const rem = bolt.thunderPerf - performance.now() / 1000;
      $("rThun").textContent =
        rem > 0
          ? "−" + rem.toFixed(1) + " s"
          : rem > -4
            ? (bolt.thunderDist / 1000).toFixed(1) + " km"
            : "—";
    }
  }
}
