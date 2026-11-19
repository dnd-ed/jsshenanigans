import * as jss from '@dnd-ed/jsshenanigans';

/**
 * Install a zstd backend so jss works in the browser.
 *
 * jss ships no Node built-ins in its hot path, but a browser still has no
 * `node:zlib`, so it needs a real zstd implementation. We hand it the WASM
 * build from `@bokuweb/zstd-wasm`.
 *
 * The `.wasm` file is served from `public/`, so the path has to include the
 * GitHub Pages base path.
 */
let backend: Promise<string> | null = null;

type ZstdWasm = {
  init: (path?: string) => Promise<void>;
  compress: (data: Uint8Array, level?: number) => Uint8Array;
  decompress: (data: Uint8Array) => Uint8Array;
};

export function loadBrowserBackend(): Promise<string> {
  backend ??= (async () => {
    // TS resolves the Node flavour of this package's types (no `init` argument),
    // so describe the browser API we actually get at runtime.
    const zstd = (await import('@bokuweb/zstd-wasm')) as unknown as ZstdWasm;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    await zstd.init(`${base}/zstd.wasm`);
    jss.register_backend({
      name: 'zstd-wasm',
      compress: (bytes) => zstd.compress(bytes),
      decompress: (bytes) => zstd.decompress(bytes),
    });
    return jss.backend_name();
  })();
  return backend;
}
