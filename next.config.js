/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // Fix Turbopack choosing the wrong workspace root when multiple lockfiles exist on disk.
  // This ensures HMR + file watching are scoped to this project directory.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
