// Patch for Next.js server to handle missing source-map module
try {
  // If source-map module is required, provide a stub implementation
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

  // Override the require function to handle 'next/dist/compiled/source-map'
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(path) {
    if (path === 'next/dist/compiled/source-map' || path.includes('source-map')) {
      console.log('Providing source-map polyfill for:', path);
      return sourceMapPolyfill;
    }
    try {
      return originalRequire.apply(this, arguments);
    } catch (e) {
      if (path === 'next/dist/compiled/source-map' || path.includes('source-map')) {
        console.log('Caught error for', path, '- providing polyfill');
        return sourceMapPolyfill;
      }
      throw e;
    }
  };

  console.log('Source-map patching applied successfully');
} catch (e) {
  console.error('Failed to patch source-map:', e);
}

module.exports = { applied: true };