// Custom server for Next.js to handle missing modules
const path = require('path');

// Load the polyfill first
try {
  require('./runtime-polyfill');
} catch (e) {
  console.error('Failed to load polyfill:', e);
}

// Try to require source-map explicitly
try {
  require('source-map');
  console.log('Source-map loaded successfully');
} catch (e) {
  console.warn('Failed to load source-map:', e);
}

// Monkey-patch module resolution
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent) {
  if (request === 'next/dist/compiled/source-map' || request.includes('source-map')) {
    try {
      return require.resolve('source-map');
    } catch (e) {
      console.warn(`Could not resolve ${request}, using polyfill`);
      return require.resolve('./runtime-polyfill');
    }
  }

  return originalResolveFilename(request, parent);
};

// Start the Next.js server
const next = require('next');
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = app.getRequestHandler();

// Export for serverless functions
module.exports = (req, res) => {
  return handler(req, res);
};