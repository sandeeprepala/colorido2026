import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:colorido%402026@db.athwlgfzwdvkuerototg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const eventTeamSizes = [
  { id: 'evt-tech-01', min: 1, max: 4 }, // Code Clash 2026
  { id: 'evt-tech-02', min: 1, max: 2 }, // Web Blitz Sprint
  { id: 'evt-tech-03', min: 2, max: 4 }, // Robo Grand Prix
  { id: 'evt-tech-04', min: 1, max: 2 }, // Byte Quest Tech Trivia
  { id: 'evt-tech-05', min: 1, max: 3 }, // AI Innovation Derby
  { id: 'evt-tech-06', min: 1, max: 3 }, // Cyber Sentinel CTF
  { id: 'evt-cult-01', min: 4, max: 12 }, // Step Up: Street Dance Battle
  { id: 'evt-cult-02', min: 3, max: 8 },  // Battle of the Bands
  { id: 'evt-cult-03', min: 6, max: 15 }, // Razzmatazz: Fashion Runway
  { id: 'evt-cult-04', min: 4, max: 12 }, // Natyashastra: One Act Play
  { id: 'evt-cult-05', min: 1, max: 1 },  // Swaralaya: Vocal Harmony (Solo)
  { id: 'evt-sport-01', min: 7, max: 11 }, // Premier Box Cricket League
  { id: 'evt-sport-02', min: 5, max: 8 },  // Futsal Thunder 5v5
  { id: 'evt-sport-03', min: 3, max: 5 },  // Slam Dunk 3v3 Basketball
  { id: 'evt-sport-04', min: 1, max: 2 },  // Smash Point Badminton Open
  { id: 'evt-sport-05', min: 6, max: 8 },  // Spikers Volleyball Clash
  { id: 'evt-mul8ycj5', min: 2, max: 4 },  // RVR Clash
  { id: 'evt-mul9dpi8', min: 7, max: 11 }, // Football
];

async function migrate() {
  console.log('Connecting to PostgreSQL to add min_team_size and max_team_size...');

  // 1. Add columns if not exist
  await pool.query(`
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1;
  `);
  console.log('Added min_team_size and max_team_size columns.');

  // 2. Update each event with appropriate team sizes
  for (const item of eventTeamSizes) {
    const res = await pool.query(
      `UPDATE events SET min_team_size = $1, max_team_size = $2 WHERE id = $3 RETURNING id, name, min_team_size, max_team_size`,
      [item.min, item.max, item.id]
    );
    if (res.rows.length > 0) {
      console.log(`✓ Updated: ${res.rows[0].name} -> Min: ${res.rows[0].min_team_size}, Max: ${res.rows[0].max_team_size}`);
    }
  }

  // Check all events
  const allEvents = await pool.query('SELECT id, name, min_team_size, max_team_size FROM events ORDER BY id ASC');
  console.log('\nAll events team size summary:');
  allEvents.rows.forEach(r => {
    console.log(`[${r.id}] ${r.name}: ${r.min_team_size} - ${r.max_team_size} members`);
  });

  await pool.end();
}

migrate().catch(console.error);
