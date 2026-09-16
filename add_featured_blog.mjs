import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log("Connected to DB.");

  try {
    await connection.execute(`
      ALTER TABLE blogs
      ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;
    `);
    console.log("Added is_featured column to blogs table.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column is_featured already exists.");
    } else {
      console.error("Migration error:", error);
    }
  }

  await connection.end();
}

run();
