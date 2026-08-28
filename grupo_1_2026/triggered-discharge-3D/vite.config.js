import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/* `npm run build` inlines everything - shaders, css, js - back into a
   single dist/index.html I can drop anywhere or record from. The folder
   layout is for me; the one file is for shipping. */
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    /* no minify: the shipped file should read like the source did -
       comments, real names, one readable script. It is 4.6 km of
       lightning, not a bundle to hide. */
    minify: false,
  },
});
