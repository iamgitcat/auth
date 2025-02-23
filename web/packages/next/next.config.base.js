// @ts-check

/**
 * @file Configure the Next.js build
 *
 * This file gets used by the Next.js build phase, and is not included in the
 * browser build. It will not be parsed by Webpack, Babel or TypeScript, so
 * don't use features that will not be available in our target node version.
 *
 * https://nextjs.org/docs/pages/api-reference/next-config-js
 */

const cp = require("child_process");

const gitSHA = cp
    .execSync("git rev-parse --short HEAD", {
        cwd: __dirname,
        encoding: "utf8",
    })
    .trimEnd();

/**
 * Configuration for the Next.js build
 *
 * @type {import("next").NextConfig}
 */
const nextConfig = {
    /* generate a static export when we run `next build` */
    output: "export",
    compiler: {
        emotion: true,
    },
    transpilePackages: [
        "@/next",
        "@/ui",
        "@/utils",
        "@mui/material",
        "@mui/system",
        "@mui/icons-material",
    ],

    // Add environment variables to the JavaScript bundle. They will be
    // available as `process.env.VAR_NAME` to our code.
    env: {
        GIT_SHA: gitSHA,
    },

    // https://dev.to/marcinwosinek/how-to-add-resolve-fallback-to-webpack-5-in-nextjs-10-i6j
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback.fs = false;
        }
        return config;
    },
};

module.exports = nextConfig;
