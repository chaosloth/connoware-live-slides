import nodeExternals from "webpack-node-externals";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Debug information about environment
console.log('===== BUILD DEBUG INFO =====');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_TURBO:', process.env.NEXT_TURBO);
console.log('__dirname (ESM):', path.dirname(fileURLToPath(import.meta.url)));

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Debug file structure
try {
  console.log('Files in current directory:', fs.readdirSync(process.cwd()));
  console.log('Files in node_modules:', fs.existsSync(path.join(process.cwd(), 'node_modules')) ?
    fs.readdirSync(path.join(process.cwd(), 'node_modules')).slice(0, 5).join(', ') + '...' : 'node_modules not found');
  console.log('Next.js package exists:', fs.existsSync(path.join(process.cwd(), 'node_modules', 'next', 'package.json')));
} catch (err) {
  console.error('Error reading directory:', err);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Add an empty turbopack config to silence the error
  turbopack: {},
  // Webpack configuration
  webpack: (config) => {
    console.log('Webpack configuration being applied');

    // Ensure source-map is included in the bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      // Using dynamic import for ESM compatibility
      'source-map': new URL('source-map', import.meta.url).href
    };

    return config;
  },
  // Explicitly include source-map in the server build
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        // Don't exclude source-map module in the trace
        '!node_modules/source-map/**',
      ],
    },
    // Force serverless target to include dependencies
    serverComponentsExternalPackages: [],
  }
};

// Log the final config
console.log('Final nextConfig:', JSON.stringify(nextConfig, null, 2));
console.log('===== END DEBUG INFO =====');

export default nextConfig;
