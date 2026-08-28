export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: Object.fromEntries(
        [
          "window","document","navigator","console","performance","requestAnimationFrame",
          "cancelAnimationFrame","matchMedia","addEventListener","removeEventListener",
          "innerWidth","innerHeight","devicePixelRatio","setTimeout","clearTimeout",
          "Image","Blob","URL","AudioContext","GPUBufferUsage","GPUTextureUsage",
          "GPUShaderStage","GPUMapMode","GPUColorWrite","fetch","location",
        ].map((k) => [k, "readonly"]),
      ),
    },
    rules: { "no-undef": "error" },
  },
];
