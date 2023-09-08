/** @type {import('next').NextConfig} */

const path = require("path");
const nodeExternals = require("webpack-node-externals");
const dotenv = require("dotenv")

dotenv.config()

const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  env: {
    BASE_URL: "http://localhost:3000",
  },
};

module.exports = {
  ...nextConfig,
  // Can't resolve 'bufferutil' and 'utf-8-validate
  // https://github.com/netlify/netlify-lambda/issues/179#issuecomment-1450473343
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Important: return the modified config
    if (isServer) {
      config.externals.push({
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
      });
    }
    return config;
  },
};
