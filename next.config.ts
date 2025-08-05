import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros do ESLint durante o build
  },
};

export default nextConfig;
