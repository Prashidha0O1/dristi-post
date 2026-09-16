import mysql from 'mysql2/promise';
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query("SHOW COLUMNS FROM articles");
  console.log("Articles full:", rows.map(r => r.Field));
  await connection.end();
}
run();
