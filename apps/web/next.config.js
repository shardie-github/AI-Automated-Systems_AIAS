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
    
    // Exclude Node.js-only modules from client bundle
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('pg', 'pg-native', '@prisma/client', 'ioredis');
    } else {
      // Exclude server-only modules from client bundle
      config.externals.push({
        'canvas': 'commonjs canvas',
        'jsdom': 'commonjs jsdom',
        'isomorphic-dompurify': 'commonjs isomorphic-dompurify',
      });
    }
    
    // Ignore server-only modules on client
    if (!isServer) {
      config.resolve.alias['@/lib/database/migrations'] = false;
      // Exclude server-only DOMPurify module
      config.resolve.alias['@/lib/utils/dompurify-server'] = false;
      // Exclude native modules that can't run in browser
      config.resolve.alias['canvas'] = false;
      config.resolve.alias['jsdom'] = false;
      // Prevent webpack from trying to bundle these
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        jsdom: false,
        'isomorphic-dompurify': false,
      };
      // Use IgnorePlugin to completely ignore these modules and their dependencies
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(canvas|jsdom|isomorphic-dompurify|agent-base|https-proxy-agent|http-proxy-agent)$/,
        }),
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            // Ignore net, tls, and other Node.js built-in modules
            if (['net', 'tls', 'dns', 'fs', 'path', 'os', 'crypto'].includes(resource)) {
              return true;
            }
            // Ignore jsdom and related packages
            if (resource.includes('jsdom') || resource.includes('canvas') || resource.includes('isomorphic-dompurify')) {
              return true;
            }
            return false;
          },
        })
      );
      // Add fallbacks for Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
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
  transpilePackages: ['@ai-consultancy/config', '@ai-consultancy/lib'],
  
  // Experimental features for faster builds
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
    // Optimize for Vercel
    outputFileTracingIncludes: {
      '/api/**': ['./**'],
    },
  },
  
  // Build optimizations
  // swcMinify is default in Next.js 15, no need to specify
  
  // TypeScript and ESLint (handled in CI)
  typescript: {
    ignoreBuildErrors: true, // Allow build to proceed, type checking done in CI
  },
  eslint: {
    ignoreDuringBuilds: true, // Linting done separately in CI
  },
};

module.exports = nextConfig;
