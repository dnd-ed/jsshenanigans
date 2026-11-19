/**
 * Exceptions raised by jsshenanigans.
 *
 * Everything the library throws derives from {@link JsshenanigansError}, so
 * callers can wrap an entire character-code pipeline in a single `catch`.
 */

/** Base class for every error raised by this library. */
export class JsshenanigansError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Raised when a string is not a valid Jujutsu Shenanigans character code. */
export class InvalidCharacterCodeError extends JsshenanigansError {}

/** Raised when no usable zstd backend could be loaded. */
export class BackendNotFoundError extends JsshenanigansError {}
