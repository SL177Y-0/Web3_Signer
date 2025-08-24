/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for Watchpack errors on Windows
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/pagefile.sys',
        '**/swapfile.sys',
        '**/DumpStack.log.tmp',
        'C:/pagefile.sys',
        'C:/swapfile.sys', 
        'C:/DumpStack.log.tmp',
      ],
      aggregateTimeout: 300,
      poll: undefined,
    }
    
    // Suppress webpack cache warnings
    config.infrastructureLogging = {
      level: 'error',
    }
    
    return config
  },
  // Suppress build warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig
