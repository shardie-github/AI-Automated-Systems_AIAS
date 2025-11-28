/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Webpack configuration for path resolution
  webpack: (config, { isServer }) => {
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
    
    // Ignore server-only modules on client
    if (!isServer) {
      config.resolve.alias['@/lib/database/migrations'] = false;
    }
    
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            ui: {
              name: 'ui',
              test: /[\\/]components[\\/]ui[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
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
