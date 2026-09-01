/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // important for Railway
  experimental: {
    serverComponentsExternalPackages: [
      'playwright-core',
      'playwright-extra',
      'puppeteer-extra-plugin-stealth',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
        'playwright-extra': 'commonjs playwright-extra',
      });
    }
    return config;
  },
};

module.exports = nextConfig;