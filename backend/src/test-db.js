import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'db.athwlgfzwdvkuerototg.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'colorido@2026',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to Supabase PostgreSQL database!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
