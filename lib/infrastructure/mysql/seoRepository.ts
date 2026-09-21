import { getPool, toBool, fromDbDateTime } from "./pool";

export type SeoRedirect = {
  id: string;
  sourcePath: string;
  destinationPath: string;
  isActive: boolean;
  createdAt: string;
};

export type Seo404Log = {
  id: string;
  path: string;
  hitCount: number;
  lastHitAt: string;
};

export async function listRedirects(): Promise<SeoRedirect[]> {
  const [rows] = await getPool().execute(
    `SELECT id, source_path as sourcePath, destination_path as destinationPath, is_active as isActive, created_at as createdAt 
     FROM seo_redirects ORDER BY created_at DESC`
  );
  return (rows as any[]).map(row => ({
    ...row,
    isActive: toBool(row.isActive),
    createdAt: fromDbDateTime(row.createdAt),
  }));
}

export async function getRedirectBySource(sourcePath: string): Promise<SeoRedirect | null> {
  const [rows] = await getPool().execute(
    `SELECT id, source_path as sourcePath, destination_path as destinationPath, is_active as isActive, created_at as createdAt 
     FROM seo_redirects WHERE source_path = ? AND is_active = 1`,
    [sourcePath]
  );
  const data = rows as any[];
  if (data.length === 0) return null;
  return {
    ...data[0],
    isActive: toBool(data[0].isActive),
    createdAt: fromDbDateTime(data[0].createdAt),
  };
}

export async function saveRedirect(redirect: Partial<SeoRedirect> & { id: string }): Promise<void> {
  const query = `INSERT INTO seo_redirects (id, source_path, destination_path, is_active)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       destination_path = VALUES(destination_path),
       is_active = VALUES(is_active)`;
  // @ts-ignore
  await getPool().execute(query, [redirect.id, redirect.sourcePath, redirect.destinationPath, redirect.isActive === false ? 0 : 1]);
}

export async function deleteRedirect(id: string): Promise<void> {
  await getPool().execute(`DELETE FROM seo_redirects WHERE id = ?`, [id]);
}

export async function list404Logs(): Promise<Seo404Log[]> {
  const [rows] = await getPool().execute(
    `SELECT id, path, hit_count as hitCount, last_hit_at as lastHitAt 
     FROM seo_404_logs ORDER BY hit_count DESC, last_hit_at DESC LIMIT 500`
  );
  return (rows as any[]).map(row => ({
    ...row,
    lastHitAt: fromDbDateTime(row.lastHitAt),
  }));
}

export async function log404(path: string): Promise<void> {
  const id = crypto.randomUUID();
  await getPool().execute(
    `INSERT INTO seo_404_logs (id, path, hit_count)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE 
       hit_count = hit_count + 1,
       last_hit_at = CURRENT_TIMESTAMP(3)`,
    [id, path]
  );
}

export async function delete404Log(path: string): Promise<void> {
  await getPool().execute(`DELETE FROM seo_404_logs WHERE path = ?`, [path]);
}
