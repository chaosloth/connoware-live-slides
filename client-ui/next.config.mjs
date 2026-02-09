import nodeExternals from "webpack-node-externals";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Disable Turbopack in production builds to avoid issues
  ...(process.env.NODE_ENV === 'production' ? {} : {
    turbopack: {
      root: process.cwd() // Use process.cwd() to ensure correct directory in all environments
    }
  })
};

export default nextConfig;
