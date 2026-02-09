// This file is a polyfill for source-map support in serverless environments
try {
  if (typeof window === 'undefined') {
    // Only run on the server side
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
    console.log('Source map support installed successfully');
  }
} catch (error) {
  console.warn('Failed to install source-map-support:', error);
}