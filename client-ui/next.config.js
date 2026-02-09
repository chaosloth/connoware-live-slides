// Using CommonJS for maximum compatibility
const path = require('path');
const fs = require('fs');

console.log('===== BUILD DEBUG INFO (CJS) =====');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_MINIMAL:', process.env.NEXT_MINIMAL);
console.log('__dirname (CJS):', __dirname);

// Debug file structure
try {
  console.log('Files in current directory:', fs.readdirSync(process.cwd()));
  console.log('Next.js package exists:', fs.existsSync(path.join(process.cwd(), 'node_modules', 'next', 'package.json')));
  console.log('Source-map exists:', fs.existsSync(path.join(process.cwd(), 'node_modules', 'source-map')));
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
  webpack: (config, { isServer }) => {
    console.log('Webpack configuration being applied, isServer:', isServer);

    // Ensure source-map is included in the bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      'source-map': require.resolve('source-map')
    };

    // Force add source-map to the bundle
    if (isServer) {
      console.log('Applying server-specific webpack config');
      const originalEntry = config.entry;

      config.entry = async () => {
        const entries = await originalEntry();

        // Add direct import for source-map
        if (entries['pages/api'] && !entries['pages/api'].includes('source-map')) {
          if (Array.isArray(entries['pages/api'])) {
            entries['pages/api'].unshift(require.resolve('source-map'));
          }
        }

        return entries;
      };
    }

    return config;
  },
  // Explicitly include required modules in the server build
  experimental: {
    // Enable module bundling in serverless functions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Avoid excluding needed modules
    outputFileTracingExcludes: {
      '*': [
        '!node_modules/source-map/**',
      ],
    },
    outputFileTracingIncludes: {
      '*': [
        'node_modules/source-map/**',
        'node_modules/next/**',
      ],
    },
    // Don't externalize any packages
    serverComponentsExternalPackages: [],
    // Include all dependencies
    incrementalCacheHandlerPath: false,
  },
  // Advanced module bundling and dependency options
  modularizeImports: {
    'source-map': {
      transform: 'source-map/{{member}}'
    }
  }
};

// Log the final config
console.log('Final nextConfig:', JSON.stringify(nextConfig, null, 2));
console.log('===== END DEBUG INFO (CJS) =====');

module.exports = nextConfig;