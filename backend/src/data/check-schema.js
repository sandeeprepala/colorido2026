import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:colorido%402026@db.athwlgfzwdvkuerototg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events'");
  console.log('Columns in events:', res.rows.map(r => r.column_name));
  await pool.end();
}

main().catch(console.error);
