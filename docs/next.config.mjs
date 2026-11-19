import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// The site is served from the custom domain jss.itzdanti.dev, so there is no
// base path. Set NEXT_PUBLIC_BASE_PATH (e.g. to "/jsshenanigans") to host it
// under a project path instead.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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
