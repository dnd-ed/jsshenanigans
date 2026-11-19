/** Base class for every error raised by this library. */
export declare class JsshenanigansError extends Error {}

/** Raised when a string is not a valid Jujutsu Shenanigans character code. */
export declare class InvalidCharacterCodeError extends JsshenanigansError {}

/** Raised when no usable zstd backend could be loaded. */
export declare class BackendNotFoundError extends JsshenanigansError {}
