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

  console.log('vercel-postbuild completed successfully.');
} catch (error) {
  console.error('Error in vercel-postbuild:', error);
  process.exit(1);
}