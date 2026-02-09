// Script to prepare the build for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('Running vercel-postbuild script...');

// Create standalone directory if it doesn't exist
const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.log('Creating standalone directory...');
  fs.mkdirSync(standaloneDir, { recursive: true });
}

// Copy routes-manifest.json to standalone directory
try {
  const routesManifestSource = path.join(process.cwd(), '.next', 'routes-manifest.json');
  const routesManifestDest = path.join(standaloneDir, 'routes-manifest.json');

  if (fs.existsSync(routesManifestSource)) {
    console.log('Copying routes-manifest.json to standalone directory...');
    fs.copyFileSync(routesManifestSource, routesManifestDest);
    console.log('routes-manifest.json copied successfully.');
  } else {
    console.error('ERROR: routes-manifest.json not found in .next directory!');
    process.exit(1);
  }
} catch (error) {
  console.error('Error copying routes-manifest.json:', error);
  process.exit(1);
}

// Copy other important files if needed
const otherFilesToCopy = [
  'app-path-routes-manifest.json',
  'build-manifest.json',
  'prerender-manifest.json'
];

otherFilesToCopy.forEach(file => {
  try {
    const source = path.join(process.cwd(), '.next', file);
    const dest = path.join(standaloneDir, file);

    if (fs.existsSync(source)) {
      console.log(`Copying ${file} to standalone directory...`);
      fs.copyFileSync(source, dest);
    }
  } catch (error) {
    console.log(`Note: Optional file ${file} not copied:`, error.message);
  }
});

console.log('vercel-postbuild completed successfully.');