// ESM version of next.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building with standalone output mode (ESM)...');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standard Next.js output for Vercel
  // output: 'standalone', // Commented out as it's causing routes-manifest issues on Vercel
  outputFileTracingRoot: __dirname,
  // Add an empty turbopack config to silence the error
  turbopack: {},
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Make source-map available in the serverless function
      try {
        // Use node require for better path resolution
        const sourceMapPath = require.resolve('source-map');

        // Add direct alias to source-map
        config.resolve.alias = {
          ...config.resolve.alias,
          'source-map': sourceMapPath,
          'next/dist/compiled/source-map': sourceMapPath
        };

        // Ensure it's not externalized
        if (config.externals) {
          const externals = Array.isArray(config.externals) ? config.externals : [config.externals];
          config.externals = externals.map(external => {
            if (typeof external !== 'function') return external;
            return (ctx, req, callback) => {
              if (req === 'source-map' || req.includes('source-map')) {
                return callback();
              }
              return external(ctx, req, callback);
            };
          });
        }

        console.log('source-map bundling configured');
      } catch (err) {
        console.error('Failed to configure source-map bundling:', err);
      }
    }
    return config;
  }
};

console.log('Using config:', {
  output: nextConfig.output,
  outputFileTracingRoot: nextConfig.outputFileTracingRoot
});

export default nextConfig;
