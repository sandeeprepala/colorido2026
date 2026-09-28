import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST || 'db.athwlgfzwdvkuerototg.supabase.co',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'colorido@2026',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Adding prize_1st, prize_2nd, prize_3rd columns...');
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS prize_1st TEXT,
      ADD COLUMN IF NOT EXISTS prize_2nd TEXT,
      ADD COLUMN IF NOT EXISTS prize_3rd TEXT;
    `);

    // Prize money breakdown for all events:
    const prizeBreakdowns = {
      'evt-tech-01': { p1: '₹14,000 + Gold Trophy', p2: '₹7,000 + Silver Trophy', p3: '₹4,000 + Bronze Medal' },
      'evt-tech-02': { p1: '₹8,000 + Gold Trophy', p2: '₹4,500 + Silver Trophy', p3: '₹2,500 + Bronze Medal' },
      'evt-tech-03': { p1: '₹11,000 + Champion Shield', p2: '₹6,000 + Runner-up Shield', p3: '₹3,000 + Bronze' },
      'evt-tech-04': { p1: '₹5,500 + Winner Cup', p2: '₹3,000 + Silver Cup', p3: '₹1,500 + Bronze Cup' },
      'evt-tech-05': { p1: '₹18,000 + Incubation Grant', p2: '₹8,000 + Seed Voucher', p3: '₹4,000 + Bronze' },
      'evt-tech-06': { p1: '₹10,000 + Cyber Shield', p2: '₹5,000 + Silver Shield', p3: '₹3,000 + Bronze Medal' },
      'evt-cult-01': { p1: '₹14,000 + Champion Belt', p2: '₹7,000 + Silver Trophy', p3: '₹4,000 + Bronze Trophy' },
      'evt-cult-02': { p1: '₹20,000 + Studio Recording', p2: '₹10,000 + Silver Trophy', p3: '₹5,000 + Bronze Trophy' },
      'evt-cult-03': { p1: '₹16,000 + Golden Crown', p2: '₹9,000 + Silver Tiara', p3: '₹5,000 + Bronze Trophy' },
      'evt-cult-04': { p1: '₹11,000 + Best Play Shield', p2: '₹6,000 + Silver Trophy', p3: '₹3,000 + Bronze Trophy' },
      'evt-cult-05': { p1: '₹8,500 + Golden Mic', p2: '₹4,500 + Silver Mic', p3: '₹2,000 + Bronze Trophy' },
      'evt-sport-01': { p1: '₹15,000 + COLORIDO Cup', p2: '₹7,000 + Silver Trophy', p3: '₹3,000 + Medals' },
      'evt-sport-02': { p1: '₹12,000 + Gold Shield', p2: '₹5,500 + Silver Trophy', p3: '₹2,500 + Medals' },
      'evt-sport-03': { p1: '₹9,000 + Hoops Trophy', p2: '₹4,000 + Silver Trophy', p3: '₹2,000 + Medals' },
      'evt-sport-04': { p1: '₹7,000 + Yonex Racquet Cup', p2: '₹3,500 + Silver Trophy', p3: '₹1,500 + Medals' },
      'evt-sport-05': { p1: '₹9,000 + Spikers Trophy', p2: '₹4,000 + Silver Trophy', p3: '₹2,000 + Medals' },
    };

    for (const [id, prizes] of Object.entries(prizeBreakdowns)) {
      await client.query(`
        UPDATE events 
        SET prize_1st = $1, prize_2nd = $2, prize_3rd = $3
        WHERE id = $4
      `, [prizes.p1, prizes.p2, prizes.p3, id]);
    }

    console.log('[PostgreSQL] 1st, 2nd, 3rd prize money breakdown updated for all events successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[PostgreSQL] Error:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

run();
