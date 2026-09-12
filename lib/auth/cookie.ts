/**
 * The session cookie name, isolated in its own tiny module with no imports.
 *
 * proxy.ts (the middleware) needs this name but must not pull in the session
 * module, which imports node:crypto, the MySQL pool and `server-only` — none of
 * which belong in the middleware bundle.
 */
export const SESSION_COOKIE = "dp_session";
