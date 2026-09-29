import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { initialEvents, initialStalls, initialLeaderboards, initialDiscussion } from './seedData.js';

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PGHOST || 'db.athwlgfzwdvkuerototg.supabase.co',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'colorido@2026',
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function runMigrationAndSeed() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Running migrations...');

    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        college TEXT,
        department TEXT,
        year TEXT,
        student_id TEXT,
        role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'volunteer')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('technical', 'cultural', 'sports')),
        description TEXT NOT NULL,
        image_url TEXT,
        venue TEXT NOT NULL,
        event_date DATE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        registration_deadline DATE NOT NULL,
        max_participants INTEGER DEFAULT 100,
        prize_pool TEXT,
        eligibility TEXT,
        rules TEXT,
        judging_criteria TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        rounds JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
        event_name TEXT NOT NULL,
        event_date TEXT,
        start_time TEXT,
        venue TEXT,
        student_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_phone TEXT,
        college TEXT,
        department TEXT,
        year TEXT,
        student_id_number TEXT,
        registration_id TEXT UNIQUE NOT NULL,
        qr_token TEXT UNIQUE NOT NULL,
        registration_data JSONB DEFAULT '{}',
        status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'cancelled')),
        registered_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stalls (
        id TEXT PRIMARY KEY,
        stall_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('food', 'game')),
        name TEXT,
        section TEXT,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'occupied', 'unavailable')),
        applicant_name TEXT,
        applicant_email TEXT,
        item_name TEXT,
        description TEXT,
        price TEXT,
        rules TEXT,
        requirements TEXT,
        manager_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS stall_applications (
        id TEXT PRIMARY KEY,
        stall_id TEXT REFERENCES stalls(stall_id) ON DELETE CASCADE,
        stall_number TEXT,
        student_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        applicant_phone TEXT,
        college TEXT,
        type TEXT NOT NULL CHECK (type IN ('food', 'game')),
        item_name TEXT NOT NULL,
        description TEXT NOT NULL,
        price TEXT NOT NULL,
        rules TEXT,
        requirements TEXT,
        manager_count INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS leaderboards (
        id TEXT PRIMARY KEY,
        event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
        sport_name TEXT NOT NULL,
        status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('LIVE', 'UPCOMING', 'COMPLETED')),
        match_info TEXT,
        entries JSONB DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discussion_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT NOT NULL,
        user_role TEXT DEFAULT 'student',
        user_dept TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        certificate_id TEXT UNIQUE NOT NULL,
        registration_id TEXT,
        event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
        event_name TEXT NOT NULL,
        participant_name TEXT NOT NULL,
        participant_email TEXT NOT NULL,
        achievement TEXT NOT NULL,
        issued_date DATE NOT NULL,
        organizer_signature TEXT,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY,
        to_email TEXT NOT NULL,
        recipient_name TEXT,
        event_id TEXT,
        event_name TEXT,
        subject TEXT NOT NULL,
        body_snippet TEXT,
        html TEXT,
        type TEXT,
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'delivered'
      );
    `);

    console.log('[PostgreSQL] Tables verified and created.');

    // 2. Clean dummy student and admin accounts, ensure EXACTLY 1 admin and 1 student account:
    // Admin account: username 'admin', email 'admin@colorido.fest'
    // Student account: username 'sandeep', email 'sandeep@college.edu'
    const adminPassHash = bcrypt.hashSync('colorido@2026', 10);
    const studentPassHash = bcrypt.hashSync('colorido@2026', 10);

    // Upsert Admin
    await client.query(`
      INSERT INTO profiles (id, username, name, email, password, role, college, department, year, phone)
      VALUES (
        'user-admin-01',
        'admin',
        'Admin',
        'admin@colorido.fest',
        $1,
        'admin',
        'Apex Institute of Technology',
        'Festival Committee',
        'Staff',
        '+91 98765 43210'
      )
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = 'admin',
        email = EXCLUDED.email;
    `, [adminPassHash]);

    // Upsert Student
    await client.query(`
      INSERT INTO profiles (id, username, name, email, password, role, college, department, year, phone, student_id)
      VALUES (
        'user-student-01',
        'sandeep',
        'Sandeep',
        'sandeep@college.edu',
        $1,
        'student',
        'Apex Institute of Technology',
        'Computer Science',
        '3rd Year',
        '+91 91234 56789',
        'CS23B1042'
      )
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = 'student',
        email = EXCLUDED.email;
    `, [studentPassHash]);

    // Upsert Volunteer
    const volunteerPassHash = bcrypt.hashSync('colorido@2026', 10);
    await client.query(`
      INSERT INTO profiles (id, username, name, email, password, role, college, department, year, phone)
      VALUES (
        'user-volunteer-01',
        'volunteer',
        'Festival Volunteer',
        'volunteer@colorido.fest',
        $1,
        'volunteer',
        'Apex Institute of Technology',
        'Event Operations Team',
        'Staff',
        '+91 98765 12345'
      )
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = 'volunteer',
        email = EXCLUDED.email;
    `, [volunteerPassHash]);

    // Remove any dummy test profiles except admin, sandeep, and volunteer
    await client.query(`
      DELETE FROM profiles WHERE username NOT IN ('admin', 'sandeep', 'volunteer');
    `);

    console.log('[PostgreSQL] Exactly 1 Admin ("admin"), 1 Volunteer ("volunteer") and 1 Student ("sandeep") configured with password "colorido@2026".');

    // 3. Populate all events
    for (const evt of initialEvents) {
      await client.query(`
        INSERT INTO events (
          id, name, category, description, image_url, venue, event_date,
          start_time, end_time, registration_deadline, max_participants,
          prize_pool, eligibility, rules, judging_criteria,
          contact_name, contact_email, contact_phone, rounds
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          venue = EXCLUDED.venue,
          event_date = EXCLUDED.event_date,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          registration_deadline = EXCLUDED.registration_deadline,
          max_participants = EXCLUDED.max_participants,
          prize_pool = EXCLUDED.prize_pool,
          eligibility = EXCLUDED.eligibility,
          rules = EXCLUDED.rules,
          judging_criteria = EXCLUDED.judging_criteria,
          contact_name = EXCLUDED.contact_name,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          rounds = EXCLUDED.rounds;
      `, [
        evt.id,
        evt.name,
        evt.category,
        evt.description,
        evt.image_url,
        evt.venue,
        evt.event_date,
        evt.start_time,
        evt.end_time,
        evt.registration_deadline,
        evt.max_participants,
        evt.prize_pool,
        evt.eligibility,
        evt.rules,
        evt.judging_criteria,
        evt.contact_name,
        evt.contact_email,
        evt.contact_phone,
        JSON.stringify(evt.rounds || []),
      ]);
    }
    console.log(`[PostgreSQL] ${initialEvents.length} events seeded successfully.`);

    // 4. Populate stalls
    for (const stall of initialStalls) {
      await client.query(`
        INSERT INTO stalls (
          id, stall_id, type, name, section, position_x, position_y, status,
          applicant_name, applicant_email, item_name, description, price, rules, requirements, manager_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (stall_id) DO UPDATE SET
          name = EXCLUDED.name,
          section = EXCLUDED.section,
          status = EXCLUDED.status,
          applicant_name = EXCLUDED.applicant_name,
          applicant_email = EXCLUDED.applicant_email,
          item_name = EXCLUDED.item_name,
          description = EXCLUDED.description,
          price = EXCLUDED.price;
      `, [
        stall.id,
        stall.stall_id,
        stall.type,
        stall.name,
        stall.section,
        stall.position_x,
        stall.position_y,
        stall.status,
        stall.applicant_name || null,
        stall.applicant_email || null,
        stall.item_name || null,
        stall.description || null,
        stall.price || null,
        stall.rules || null,
        stall.requirements || null,
        stall.manager_count || 0,
      ]);
    }
    console.log(`[PostgreSQL] ${initialStalls.length} stalls seeded successfully.`);

    // 5. Populate leaderboards
    for (const lb of initialLeaderboards) {
      await client.query(`
        INSERT INTO leaderboards (id, event_id, sport_name, status, match_info, entries)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          sport_name = EXCLUDED.sport_name,
          status = EXCLUDED.status,
          match_info = EXCLUDED.match_info,
          entries = EXCLUDED.entries;
      `, [
        lb.id,
        lb.event_id,
        lb.sport_name,
        lb.status,
        lb.match_info,
        JSON.stringify(lb.entries || []),
      ]);
    }
    // 6. Populate initial discussion messages
    for (const msg of initialDiscussion) {
      await client.query(`
        INSERT INTO discussion_messages (id, user_id, user_name, user_role, user_dept, message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [
        msg.id,
        msg.user_id,
        msg.user_name,
        msg.user_role || 'student',
        msg.user_dept || 'Festival Community',
        msg.message,
        msg.created_at || new Date().toISOString(),
      ]);
    }
    console.log(`[PostgreSQL] ${initialDiscussion.length} discussion messages seeded successfully.`);

    console.log('[PostgreSQL] Migration & Seed Complete!');
  } catch (err) {
    console.error('[PostgreSQL] Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}
