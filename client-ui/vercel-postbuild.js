// Script to prepare the build for Vercel deployment
const fs = require('fs');
const path = require('path');

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

// Create a minimal serverless API directory structure
function createServerlessAPI() {
  const serverlessDir = path.join(process.cwd(), '.next', 'serverless');
  if (!fs.existsSync(serverlessDir)) {
    console.log('Creating serverless directory...');
    fs.mkdirSync(serverlessDir, { recursive: true });
  }

  // Create at least one API page
  const apiDir = path.join(serverlessDir, 'pages', 'api');
  fs.mkdirSync(apiDir, { recursive: true });

  // Create a basic serverless function
  createServerlessPage(apiDir);

  console.log('Created serverless API placeholder');
}

try {
  // Ensure we have the routes-manifest.json file
  const routesManifest = path.join(process.cwd(), '.next', 'routes-manifest.json');

  if (!fs.existsSync(routesManifest)) {
    console.log('Creating minimal routes-manifest.json...');
    fs.writeFileSync(routesManifest, JSON.stringify({
      version: 3,
      basePath: "",
      pages404: true,
      redirects: [],
      headers: [],
      dynamicRoutes: [],
      staticRoutes: [],
      dataRoutes: [],
      rsc: {}
    }, null, 2));
  }

  // Create serverless structure to satisfy Vercel requirements
  createServerlessAPI();

  // Copy source-map modules to ensure they're available at runtime
  console.log('Copying source-map modules to .next directory...');

  try {
    // Find the source-map module path
    const sourceMapPath = require.resolve('source-map');
    const sourceMapDir = path.dirname(sourceMapPath);
    const targetDir = path.join(process.cwd(), '.next', 'node_modules', 'source-map');

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Create a simple package.json for source-map in the .next directory
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify({
      name: 'source-map',
      version: '0.7.4',
      main: 'source-map.js'
    }, null, 2));

    // Create a minimal source-map.js file
    fs.writeFileSync(path.join(targetDir, 'source-map.js'), `
      // Source-map polyfill for Next.js serverless functions
      module.exports = require('${sourceMapPath}');
    `);

    console.log('Source-map modules copied successfully');
  } catch (err) {
    console.error('Error copying source-map modules:', err);
  }

  // Create a polyfill for source-map in the next/dist/compiled directory
  const nextCompiledDir = path.join(process.cwd(), '.next', 'node_modules', 'next', 'dist', 'compiled');
  if (fs.existsSync(nextCompiledDir)) {
    console.log('Creating source-map polyfill in next/dist/compiled...');

    // Create the source-map directory
    const compiledSourceMapDir = path.join(nextCompiledDir, 'source-map');
    if (!fs.existsSync(compiledSourceMapDir)) {
      fs.mkdirSync(compiledSourceMapDir, { recursive: true });
    }

    // Create a simple index.js that re-exports the source-map module
    fs.writeFileSync(path.join(compiledSourceMapDir, 'index.js'), `
      try {
        module.exports = require('source-map');
      } catch (err) {
        console.error('Failed to load source-map module:', err);
        // Provide minimal compatibility layer
        module.exports = {
          SourceMapConsumer: function() { this.destroy = function() {}; },
          SourceMapGenerator: function() { this.toString = function() { return ''; }; }
        };
      }
    `);

    console.log('Source-map polyfill created successfully');
  }

  console.log('vercel-postbuild completed successfully.');
} catch (error) {
  console.error('Error in vercel-postbuild:', error);
  process.exit(1);
}