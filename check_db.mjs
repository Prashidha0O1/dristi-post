import mysql from 'mysql2/promise';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const rawUrl = env.split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1].trim();
const dbUrl = rawUrl.replace(/^["']|["']$/g, '');

async function run() {
  try {
    const db = await mysql.createConnection(dbUrl);
    const [arts] = await db.query('SELECT heroImage FROM blogs LIMIT 1');
    console.log("Hero Image:", arts[0].heroImage);
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
