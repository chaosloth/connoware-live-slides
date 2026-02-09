// Using CommonJS for maximum compatibility
const path = require('path');
const fs = require('fs');

console.log('===== BUILD DEBUG INFO (CJS) =====');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_TURBO:', process.env.NEXT_TURBO);
console.log('__dirname (CJS):', __dirname);

// Debug file structure
try {
  console.log('Files in current directory:', fs.readdirSync(process.cwd()));
  console.log('Next.js package exists:', fs.existsSync(path.join(process.cwd(), 'node_modules', 'next', 'package.json')));
} catch (err) {
  console.error('Error reading directory:', err);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Add an empty turbopack config to silence the error
  turbopack: {},
  // Webpack configuration
  webpack: (config) => {
    console.log('Webpack configuration being applied');
    return config;
  }
};

// Log the final config
console.log('Final nextConfig:', JSON.stringify(nextConfig, null, 2));
console.log('===== END DEBUG INFO (CJS) =====');

module.exports = nextConfig;