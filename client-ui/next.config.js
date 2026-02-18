// Basic Next.js config
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow static export when specified in the command
  output: process.env.NEXT_STATIC_EXPORT ? 'export' : undefined,
  // Webpack configuration
  webpack: (config, { isServer }) => {
    console.log('Webpack configuration being applied, isServer:', isServer);

    // Configure for source-map support
    if (isServer) {
      // Add source-map to the bundle directly
      config.resolve.alias = {
        ...config.resolve.alias,
        'source-map': require.resolve('source-map'),
        'next/dist/compiled/source-map': require.resolve('source-map')
      };
    }

    return config;
  }
};

module.exports = nextConfig;