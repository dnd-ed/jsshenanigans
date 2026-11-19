/** Every zstd frame begins with these four bytes. */
export declare const ZSTD_MAGIC: Uint8Array;

/** Environment variable used to prefer a specific zstd backend. */
export declare const ENV_BACKEND: string;

/** Return the name of the zstd implementation currently in use. */
export declare function backend_name(): string;

/** zstd-compress a JSON string and base64-encode the result. */
export declare function compress(rawJson: string): string;

/** Base64-decode `code` and zstd-decompress it back into a JSON string. */
export declare function decompress(code: string): string;

/** Serialise a character payload (an array of skills) into a character code. */
export declare function encode(payload: unknown): string;

/** Decode a character code back into JavaScript objects. */
export declare function decode(code: string): unknown;
