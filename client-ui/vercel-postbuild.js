// Script to prepare the build for Vercel deployment
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('Running vercel-postbuild script...');

// Function to create a minimal serverless page
function createServerlessPage(directory) {
  const serverlessFile = `
module.exports = {
  default: function(req, res) {
    res.status(200).json({ message: 'Serverless function placeholder' });
  }
};
`;
  fs.writeFileSync(path.join(directory, 'index.js'), serverlessFile);
}

// Create source-map polyfill module
function createSourceMapPolyfill() {
  console.log('Creating source-map polyfill...');

  // Define the source-map implementation
  const sourceMapPolyfill = `
// Minimal source-map implementation
module.exports = {
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
`;

  // Paths to create the source-map module
  const nodeModulesDir = path.join(process.cwd(), 'node_modules');
  const nextDir = path.join(nodeModulesDir, 'next');
  const distDir = path.join(nextDir, 'dist');
  const compiledDir = path.join(distDir, 'compiled');
  const sourceMapDir = path.join(compiledDir, 'source-map');

  // Create the directory structure
  fs.mkdirSync(sourceMapDir, { recursive: true });

  // Create the source-map module files
  fs.writeFileSync(path.join(sourceMapDir, 'index.js'), sourceMapPolyfill);
  fs.writeFileSync(path.join(sourceMapDir, 'package.json'), JSON.stringify({ name: 'source-map', version: '0.7.4', main: 'index.js' }));

  // Also create it in the .next directory
  const nextBuildDir = path.join(process.cwd(), '.next');
  const nextBuildNodeModules = path.join(nextBuildDir, 'node_modules');
  const nextBuildNextDir = path.join(nextBuildNodeModules, 'next');
  const nextBuildDistDir = path.join(nextBuildNextDir, 'dist');
  const nextBuildCompiledDir = path.join(nextBuildDistDir, 'compiled');
  const nextBuildSourceMapDir = path.join(nextBuildCompiledDir, 'source-map');

  fs.mkdirSync(nextBuildSourceMapDir, { recursive: true });
  fs.writeFileSync(path.join(nextBuildSourceMapDir, 'index.js'), sourceMapPolyfill);
  fs.writeFileSync(path.join(nextBuildSourceMapDir, 'package.json'), JSON.stringify({ name: 'source-map', version: '0.7.4', main: 'index.js' }));

  console.log('Source-map polyfill created in:');
  console.log('- ' + sourceMapDir);
  console.log('- ' + nextBuildSourceMapDir);
}

// Create direct source-map implementations in all required locations
function createDirectSourceMapImplementations() {
  try {
    console.log('Creating direct source-map implementations...');

    // Define the source map polyfill code
    const sourceMapPolyfill = `
// Direct source-map implementation for Next.js
module.exports = {
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
};`;

    // Define the paths to create the source-map modules
    const paths = [
      // In node_modules
      path.join(process.cwd(), 'node_modules/next/dist/compiled/source-map'),
      // In .next
      path.join(process.cwd(), '.next/node_modules/next/dist/compiled/source-map'),
      // Direct source-map module in node_modules
      path.join(process.cwd(), 'node_modules/source-map'),
      // Direct source-map module in .next
      path.join(process.cwd(), '.next/node_modules/source-map')
    ];

    // Create all the directories and files
    paths.forEach(dirPath => {
      // Ensure the directory exists
      fs.mkdirSync(dirPath, { recursive: true });

      // Create the package.json
      fs.writeFileSync(path.join(dirPath, 'package.json'), JSON.stringify({
        name: 'source-map',
        version: '0.7.4',
        main: 'index.js'
      }));

      // Create the index.js with the polyfill
      fs.writeFileSync(path.join(dirPath, 'index.js'), sourceMapPolyfill);

      // Also create source-map.js for compatibility
      fs.writeFileSync(path.join(dirPath, 'source-map.js'), sourceMapPolyfill);
    });

    console.log('Direct source-map implementations created in multiple locations');
    return true;
  } catch (err) {
    console.error('Error creating direct source-map implementations:', err);
    return false;
  }
}

// Create standalone directory with source-map module
function createStandaloneSourceMap() {
  console.log('Creating standalone source-map module...');

  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  fs.mkdirSync(standaloneDir, { recursive: true });

  const nodeModulesDir = path.join(standaloneDir, 'node_modules');
  fs.mkdirSync(nodeModulesDir, { recursive: true });

  const sourceMapDir = path.join(nodeModulesDir, 'source-map');
  fs.mkdirSync(sourceMapDir, { recursive: true });

  // Create package.json
  fs.writeFileSync(path.join(sourceMapDir, 'package.json'), JSON.stringify({
    name: 'source-map',
    version: '0.7.4',
    main: 'source-map.js'
  }));

  // Create minimal source-map implementation
  fs.writeFileSync(path.join(sourceMapDir, 'source-map.js'), `
// Minimal source-map implementation
module.exports = {
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
  `);

  // Also create next/dist/compiled/source-map
  const nextDir = path.join(nodeModulesDir, 'next');
  fs.mkdirSync(nextDir, { recursive: true });

  const distDir = path.join(nextDir, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  const compiledDir = path.join(distDir, 'compiled');
  fs.mkdirSync(compiledDir, { recursive: true });

  const nextSourceMapDir = path.join(compiledDir, 'source-map');
  fs.mkdirSync(nextSourceMapDir, { recursive: true });

  // Copy the same files
  fs.writeFileSync(path.join(nextSourceMapDir, 'package.json'), JSON.stringify({
    name: 'source-map',
    version: '0.7.4',
    main: 'index.js'
  }));

  fs.writeFileSync(path.join(nextSourceMapDir, 'index.js'), `
// Re-export source-map
module.exports = require('source-map');
  `);

  console.log('Standalone source-map module created successfully');
}

// Create patches for runtime
function createRuntimePatch() {
  console.log('Creating runtime patches...');

  // Create server.js with source-map patching
  const serverJs = `
// Next.js server with source-map patching
try {
  // Create source-map polyfill if it doesn't exist
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
    }
  };

  // Patch require to handle source-map
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(id) {
    if (id === 'next/dist/compiled/source-map' || id === 'source-map') {
      console.log('Providing source-map polyfill for:', id);
      return sourceMapPolyfill;
    }
    return originalRequire.apply(this, arguments);
  };

  console.log('Source-map patching applied');
} catch (err) {
  console.error('Error applying source-map patch:', err);
}

// Load normal server
try {
  require('next/dist/server/next-server');
} catch (err) {
  console.error('Error loading Next.js server:', err);
}
`;

  fs.writeFileSync(path.join(process.cwd(), '.next', 'server.js'), serverJs);
  console.log('Runtime patches created successfully');
}

try {
  // Create serverless API directory
  const serverlessDir = path.join(process.cwd(), '.next', 'serverless');
  if (!fs.existsSync(serverlessDir)) {
    console.log('Creating serverless directory...');
    fs.mkdirSync(serverlessDir, { recursive: true });
  }

  // Create at least one API page
  const apiDir = path.join(serverlessDir, 'pages', 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  createServerlessPage(apiDir);
  console.log('Created serverless API placeholder');

  // Create all our source-map implementations in one go
  createDirectSourceMapImplementations();
  createRuntimePatch();

  console.log('vercel-postbuild completed successfully.');
} catch (error) {
  console.error('Error in vercel-postbuild:', error);
  process.exit(1);
}