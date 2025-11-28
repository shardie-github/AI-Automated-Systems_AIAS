/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Webpack configuration for path resolution
  webpack: (config) => {
    const rootDir = path.resolve(__dirname, '../..');
    
    // Add path aliases for webpack resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': rootDir,
      '@/components': path.resolve(rootDir, 'components'),
      '@/components/ui': path.resolve(rootDir, 'components/ui'),
      '@/lib': path.resolve(rootDir, 'lib'),
      '@/app': path.resolve(rootDir, 'app'),
    };
    
    return config;
  },
  
  // Transpile packages from workspace root
  transpilePackages: [],
  
  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
    ],
  },
};

module.exports = nextConfig;
