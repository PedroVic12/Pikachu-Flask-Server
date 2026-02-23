/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

const withPWA = require("next-pwa")({
  dest: "public"
})

module.exports = withPWA(nextConfig)
