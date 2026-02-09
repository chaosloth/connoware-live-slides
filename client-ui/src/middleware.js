// This middleware will run on every request
// Its purpose is to ensure the source-map module is loaded in the serverless environment

export async function middleware(request) {
  // Just return the request to continue the chain
  return;
}

// Import source-map in the middleware to ensure it's bundled
import 'source-map';