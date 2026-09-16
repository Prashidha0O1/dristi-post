import mysql from 'mysql2/promise';
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query("SHOW COLUMNS FROM articles LIKE 'meta_description%'");
  console.log("Articles:", rows);
  const [jobRows] = await connection.query("SHOW COLUMNS FROM jobs LIKE 'meta_description%'");
  console.log("Jobs:", jobRows);
  await connection.end();
}
run();
