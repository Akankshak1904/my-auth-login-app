/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config) {
    config.cache = false; // disable webpack cache to reduce memory load
    return config;
  }
};

export default nextConfig;

