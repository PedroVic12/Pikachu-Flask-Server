/* ----------------------------------------------------------------
   Shader assembly.

   Every .wgsl file here is a real shader file, so editors give me
   syntax highlighting and the compiler errors point at real lines.
   The chunks that get reused (the sim header, the Sel struct, the
   render header, the fullscreen-triangle VS) are concatenated back
   together at import time - WGSL has no #include, so this is the
   include.
   ---------------------------------------------------------------- */

import simCommonSrc from "./compute/common.wgsl?raw";
import selSrc from "./compute/sel-struct.wgsl?raw";
import growMathSrc from "./compute/growth-math.wgsl?raw";
import growResetSrc from "./compute/growth-reset.wgsl?raw";
import growSelectSrc from "./compute/growth-select.wgsl?raw";
import growResolveSrc from "./compute/growth-resolve.wgsl?raw";
import upSelectSrc from "./compute/upward-select.wgsl?raw";
import upResolveSrc from "./compute/upward-resolve.wgsl?raw";
import jacobiSrc from "./compute/jacobi.wgsl?raw";
import clearSrc from "./compute/clear.wgsl?raw";
import residualSrc from "./compute/residual.wgsl?raw";
import forkSrc from "./compute/fork.wgsl?raw";
import renCommonSrc from "./render/common.wgsl?raw";
import fSQuadSrc from "./render/fullscreen.wgsl?raw";
import skySrc from "./render/sky.wgsl?raw";
import terrainSrc from "./render/terrain.wgsl?raw";
import splatSrc from "./render/channel.wgsl?raw";
import downFirstSrc from "./render/bloom-down-first.wgsl?raw";
import downSrc from "./render/bloom-down.wgsl?raw";
import upSrc from "./render/bloom-up.wgsl?raw";
import finalSrc from "./render/composite.wgsl?raw";

export const wgslSimCommon = simCommonSrc;
export const wgslSel = selSrc;
export const wgslGrowMath = wgslSimCommon + wgslSel + growMathSrc;
export const wgslGrowReset = wgslSimCommon + wgslSel + growResetSrc;
export const wgslGrowSelect = wgslGrowMath + growSelectSrc;
export const wgslGrowResolve = wgslGrowMath + growResolveSrc;
export const wgslUpSelect = wgslGrowMath + upSelectSrc;
export const wgslUpResolve = wgslGrowMath + upResolveSrc;
export const wgslJacobi = wgslSimCommon + jacobiSrc;
export const wgslClear = wgslSimCommon + clearSrc;
export const wgslResidual = wgslSimCommon + residualSrc;
export const wgslFork = wgslSimCommon + forkSrc;
export const wgslRenCommon = renCommonSrc;
export const wgslFSQuad = fSQuadSrc;
export const wgslSky = wgslFSQuad + wgslRenCommon + skySrc;
export const wgslTerrain = wgslRenCommon + terrainSrc;
export const wgslSplat = wgslRenCommon + splatSrc;
export const wgslDownFirst = wgslFSQuad + downFirstSrc;
export const wgslDown = wgslFSQuad + downSrc;
export const wgslUp = wgslFSQuad + upSrc;
export const wgslFinal = wgslFSQuad + wgslRenCommon + finalSrc;
