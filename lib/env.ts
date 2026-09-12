/**
 * Checked environment access.
 *
 * Previously every call site did `process.env.NEXT_PUBLIC_SUPABASE_URL!`. The
 * `!` is erased at compile time, so a missing variable produced a confusing
 * throw from deep inside the Supabase client ("Your project's URL and API key
 * are required") rather than naming what was actually missing. In production
 * that surfaced as an opaque 500 on /admin/articles/new.
 *
 * NOTE: each NEXT_PUBLIC_ variable MUST be referenced as a literal
 * `process.env.NEXT_PUBLIC_FOO` expression. Next inlines these by static text
 * substitution at build time, so a dynamic `process.env[name]` lookup would
 * silently read undefined in any client bundle.
 */

export class MissingEnvError extends Error {
  constructor(public readonly variable: string) {
    super(
      `Missing required environment variable ${variable}. ` +
        `Set it in .env.local for development, or in the hosting environment for production. ` +
        `Note that NEXT_PUBLIC_* variables are baked in at build time — adding one ` +
        `after a deploy requires a rebuild, not just a restart.`,
    );
    this.name = "MissingEnvError";
  }
}

function required(variable: string, value: string | undefined): string {
  if (!value) throw new MissingEnvError(variable);
  return value;
}

/**
 * MySQL connection string, e.g.
 *   mysql://user:password@host:3306/dbname
 * Server-only (no NEXT_PUBLIC_ prefix): it is never inlined into a client
 * bundle, and must never be — it carries the database password.
 */
export function databaseUrl(): string {
  return required("DATABASE_URL", process.env.DATABASE_URL);
}

/**
 * Whether a MySQL database is configured. Non-throwing, for the container's
 * adapter selection — absence is valid (it falls back to Supabase or in-memory).
 */
export function hasDatabaseEnv(): boolean {
  return !!process.env.DATABASE_URL;
}
