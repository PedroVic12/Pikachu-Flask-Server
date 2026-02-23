/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

// npm install next-pwa

// Adiciona e exporta o website como WebApp igual Flutter
const withPWA = require("next-pwa")({
  dest: "public"
})

module.exports = withPWA(nextConfig)
