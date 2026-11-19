import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, basePath, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // The square logo, used in the docs and home nav bars.
      title: (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${basePath}/jss_logo_small.png`}
          alt={appName}
          className="h-7 w-7 rounded-md"
        />
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
