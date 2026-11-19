import Link from 'next/link';

import { basePath } from '@/lib/shared';

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${basePath}/jss_logo.png`}
        alt="jsshenanigans"
        className="mx-auto w-full max-w-xl"
      />
      <p className="text-fd-muted-foreground">
        Build, load and edit Jujutsu Shenanigans movesets from JavaScript.
      </p>
      <pre className="mx-auto rounded-lg border bg-fd-secondary p-3 text-left font-mono text-sm">
        npm install @dnd-ed/jsshenanigans
      </pre>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-fd-primary px-4 py-2 text-fd-primary-foreground"
        >
          Read the docs
        </Link>
        <Link href="/editor" className="rounded-md border px-4 py-2">
          Open the moveset editor
        </Link>
      </div>
      <p className="text-sm text-fd-muted-foreground">
        The editor runs entirely in your browser, which is a genuinely useful test of
        the library: it has to work without Node.js.
      </p>
    </div>
  );
}
