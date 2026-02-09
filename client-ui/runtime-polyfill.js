// Runtime polyfill for missing modules in Next.js serverless functions

try {
  // Try to monkeypatch the require function to handle missing source-map module
  const originalRequire = module.constructor.prototype.require;

  module.constructor.prototype.require = function(path) {
    try {
      // Try the original require first
      return originalRequire.apply(this, arguments);
    } catch (e) {
      // If it fails for source-map, provide a stub implementation
      if (path === 'next/dist/compiled/source-map' || path.includes('source-map')) {
        console.log(`[Polyfill] Providing stub for ${path}`);
        return {
          SourceMapConsumer: function() { this.destroy = function() {}; },
          SourceMapGenerator: function() { this.toString = function() { return ''; }; }
        };
      }

      // For other modules, throw the original error
      throw e;
    }
  };

  console.log('[Polyfill] Module patching complete');
} catch (error) {
  console.error('[Polyfill] Error setting up module patching:', error);
}

module.exports = { installed: true };