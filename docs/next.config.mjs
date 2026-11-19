import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages serves project sites from /<repo>/, so the base path is
// configurable and defaults to that. Set NEXT_PUBLIC_BASE_PATH="" for a
// custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/jsshenanigans';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // The library is consumed straight from the repository (file:..), so Next
  // has to compile it like app code.
  transpilePackages: ['@dnd-ed/jsshenanigans'],
};

export default withMDX(config);
