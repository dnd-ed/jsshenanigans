import type { Metadata } from 'next';

import { MovesetEditor } from '@/components/moveset-editor';
import { basePath } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Moveset editor',
  description: 'Load a JJS character code, edit it with jss, and export a new one.',
};

export default function EditorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${basePath}/jss_editor_logo.png`}
        alt="jsshenanigans moveset editor"
        className="mb-6 w-full max-w-2xl rounded-xl border"
      />
      <h1 className="text-3xl font-bold">Moveset editor</h1>
      <p className="mt-2 text-fd-muted-foreground">
        Paste a character code to load it, edit the skills and nodes, then export a new
        code. Everything runs in your browser through{' '}
        <code className="font-mono text-sm">@dnd-ed/jsshenanigans</code>.
      </p>
      <MovesetEditor />
    </main>
  );
}
