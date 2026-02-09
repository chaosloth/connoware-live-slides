// Global source-map polyfill for Next.js on Vercel
console.log('Loading _launcher.js polyfill');

// Create source-map polyfill
const sourceMapPolyfill = {
  SourceMapConsumer: function() {
    this.destroy = function() {};
    this.sourceContentFor = function() { return null; };
    this.sources = [];
    this.sourcesContent = [];
    this.originalPositionFor = function() { return { source: null, line: null, column: null, name: null }; };
  },
  SourceMapGenerator: function() {
    this.toString = function() { return ''; };
    this.addMapping = function() {};
    this.setSourceContent = function() {};
  },
  SourceNode: function() {
    this.toString = function() { return ''; };
    this.fromStringWithSourceMap = function() { return this; };
    this.add = function() { return this; };
    this.prepend = function() { return this; };
    this.walk = function() {};
    this.walkSourceContents = function() {};
    this.join = function() { return ''; };
    this.replaceRight = function() { return ''; };
  }
};

// Monkey patch require
try {
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(path) {
    // Check for source-map requests
    if (path === 'next/dist/compiled/source-map' || path.includes('source-map')) {
      console.log('Providing source-map polyfill for:', path);
      return sourceMapPolyfill;
    }

    // Try the original require
    try {
      return originalRequire.apply(this, arguments);
    } catch (e) {
      // If it fails for source-map, return our polyfill
      if (path === 'next/dist/compiled/source-map' || path.includes('source-map')) {
        console.log('Caught error for', path, '- providing polyfill');
        return sourceMapPolyfill;
      }
      throw e;
    }
  };

  console.log('Successfully patched require function for source-map');
} catch (e) {
  console.error('Failed to patch require function:', e);
}

// Export the polyfill
module.exports = sourceMapPolyfill;