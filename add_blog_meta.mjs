import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected to DB.");

  try {
    await connection.execute(`
      ALTER TABLE blogs
      ADD COLUMN meta_description_ne VARCHAR(500) NULL,
      ADD COLUMN meta_description_en VARCHAR(500) NULL;
    `);
    console.log("Added meta_description columns to blogs table.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.error("Migration error:", error);
    }
  }

  await connection.end();
}

run();
