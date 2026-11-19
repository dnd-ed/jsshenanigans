import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'jsshenanigans';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const editorRoute = '/editor';

/** Sub-path the site is served from; empty on the custom domain. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Absolute URL of the deployed site, used for metadata. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jss.itzdanti.dev';

export const gitConfig = {
  user: 'dnd-ed',
  repo: 'jsshenanigans',
  branch: 'main',
};

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: `${basePath}${getImageUrl(segments, page.locale)}` };
}
