/* ----------------------------------------------------------------
   Entry point.

   Nothing happens here. The two ui modules register their listeners
   on import; init() builds the device, buffers and pipelines, fires
   the first bolt and starts the frame loop.
   ---------------------------------------------------------------- */

import { init } from "./core/gpu.js";

import "./ui/controls.js"; // sliders + buttons
import "./ui/input.js";    // orbit, pinch, click-to-strike

init();
