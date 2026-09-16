import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    await connection.execute(`
      ALTER TABLE articles 
      CHANGE COLUMN metaDescription metaDescriptionNe VARCHAR(500) NULL,
      ADD COLUMN metaDescriptionEn VARCHAR(500) NULL;
    `);
    console.log("Updated articles table.");
  } catch (e) { console.log(e.message); }

  try {
    await connection.execute(`
      ALTER TABLE jobs 
      ADD COLUMN metaDescriptionNe VARCHAR(500) NULL,
      ADD COLUMN metaDescriptionEn VARCHAR(500) NULL;
    `);
    console.log("Updated jobs table.");
  } catch (e) { console.log(e.message); }

  await connection.end();
}
run();
