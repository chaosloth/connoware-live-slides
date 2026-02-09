import nodeExternals from "webpack-node-externals";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  reactStrictMode: true,
  turbopack: {
    root: __dirname // Set the workspace root to the current directory
  },
};

export default nextConfig;
