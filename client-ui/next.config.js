// Basic Next.js config with standalone output
const path = require('path');

console.log('Building with standalone output mode...');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standard Next.js output - no specific output mode
  outputFileTracingRoot: path.join(__dirname),
  // Add an empty turbopack config to silence the error
  turbopack: {},
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

console.log('Using config:', JSON.stringify({
  output: nextConfig.output,
  turbopack: nextConfig.turbopack ? 'configured' : 'not configured'
}, null, 2));

module.exports = nextConfig;