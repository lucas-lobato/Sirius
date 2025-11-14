/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ ignora erros de lint durante a build (não em dev)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ ignora erros de TypeScript apenas durante a build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

