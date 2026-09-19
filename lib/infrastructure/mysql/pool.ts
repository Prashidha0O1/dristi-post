import mysql from "mysql2/promise";
import { databaseUrl } from "@/lib/env";

/**
 * Shared MySQL connection pool.
 *
 * One pool per process, memoised on globalThis so Next's dev-mode module
 * reloading (and warm serverless instances) reuse a single pool instead of
 * leaking a new one on every reload.
 *
 * Date handling: the schema stores every timestamp in UTC, and `timezone: "Z"`
 * tells mysql2 to both write and interpret values as UTC. `dateStrings: true`
 * makes it hand back plain strings rather than JS Dates, which keeps conversion
 * to the domain's ISO-8601 strings explicit and free of local-timezone drift.
 */
declare global {
  // eslint-disable-next-line no-var
  var __dristiMysqlPool: mysql.Pool | undefined;
}

function buildPoolConfig(): mysql.PoolOptions {
  const url = new URL(databaseUrl());
  const common: mysql.PoolOptions = {
    // URL parts are percent-encoded; decode so a password like "Muskan%40121"
    // becomes "Muskan@121".
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    timezone: "Z",
    dateStrings: true,
    connectionLimit: 5,
    namedPlaceholders: false,
    // utf8mb4 so Devanagari round-trips intact.
    charset: "utf8mb4",
    supportBigNumbers: true,
  };

  // On cPanel a TCP connection to localhost is seen by MySQL as coming from the
  // server's public hostname, which the cPanel grant (user@localhost) does not
  // cover -> "access denied to database" (1044). Connecting through the MySQL
  // unix socket is identified as @localhost and matches the grant. The socket
  // path is overridable via MYSQL_SOCKET; /var/lib/mysql/mysql.sock is the
  // cPanel default.
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isLocal) {
    return { ...common, socketPath: process.env.MYSQL_SOCKET || "/var/lib/mysql/mysql.sock" };
  }
  return { ...common, host: url.hostname, port: Number(url.port) || 3306 };
}

export function getPool(): mysql.Pool {
  if (!globalThis.__dristiMysqlPool) {
    globalThis.__dristiMysqlPool = mysql.createPool(buildPoolConfig());
  }
  return globalThis.__dristiMysqlPool;
}

/** A DATETIME(3) string from the DB ("YYYY-MM-DD HH:MM:SS.SSS", UTC) -> ISO. */
export function fromDbDateTime(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  // "2024-01-01 12:00:00.000" -> "2024-01-01T12:00:00.000Z"
  return `${s.replace(" ", "T")}${s.includes(".") ? "" : ".000"}Z`;
}

/** An ISO datetime string -> the "YYYY-MM-DD HH:MM:SS.SSS" MySQL expects (UTC). */
export function toDbDateTime(iso: string | undefined): string | null {
  if (!iso) return null;
  // new Date normalises any offset to UTC; slice drops the trailing "Z".
  return new Date(iso).toISOString().slice(0, 23).replace("T", " ");
}

/** A DATE column ("YYYY-MM-DD") passes through unchanged both ways. */
export function fromDbDate(value: unknown): string | undefined {
  if (value == null) return undefined;
  // With dateStrings the driver already returns "YYYY-MM-DD".
  return String(value).slice(0, 10);
}

/** TINYINT(1) -> boolean. */
export function toBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}
