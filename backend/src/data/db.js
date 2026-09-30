import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { initialEvents, initialStalls, initialLeaderboards, initialDiscussion } from './seedData.js';

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PGHOST || 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres.athwlgfzwdvkuerototg',
  password: process.env.PGPASSWORD || 'colorido@2026',
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
});

const initialRegistrations = [
  {
    id: 'reg-demo-01',
    event_id: 'evt-tech-01',
    event_name: 'Code Clash 2026',
    event_category: 'Technical',
    event_date: '2026-10-18',
    start_time: '10:00 AM',
    venue: 'Turing Computing Lab, Innovation Block',
    student_id: 'user-student-01',
    student_name: 'Sandeep Sharma',
    student_email: 'sandeep@college.edu',
    student_phone: '+91 91234 56789',
    college: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    student_id_number: 'CS23B1042',
    registration_id: 'COL-2026-8F92K',
    qr_token: 'qr-col26-8f92k-sandeep',
    status: 'confirmed',
    registered_at: '2026-09-26T11:50:10.840Z',
  },
  {
    id: 'reg-demo-02',
    event_id: 'evt-tech-02',
    event_name: 'Web Blitz Sprint',
    event_category: 'Technical',
    event_date: '2026-10-18',
    start_time: '11:00 AM',
    venue: 'IT Software Lab 3, Innovation Block',
    student_id: 'user-student-02',
    student_name: 'Priya Patel',
    student_email: 'priya@college.edu',
    student_phone: '+91 98989 89898',
    college: 'Apex Institute of Technology',
    department: 'Electronics & Communication',
    year: '2nd Year',
    student_id_number: 'EC24B2019',
    registration_id: 'COL-2026-W3B91',
    qr_token: 'qr-col26-w3b91-priya',
    status: 'attended',
    checkin_time: '10:45 AM',
    registered_at: '2026-09-27T10:15:00.000Z',
  },
  {
    id: 'reg-demo-03',
    event_id: 'evt-tech-03',
    event_name: 'Robo Grand Prix',
    event_category: 'Robotics',
    event_date: '2026-10-19',
    start_time: '09:30 AM',
    venue: 'Mechanical Courtyard Arena',
    student_id: 'user-student-03',
    student_name: 'Rahul Verma',
    student_email: 'rahul@college.edu',
    student_phone: '+91 97777 66666',
    college: 'Metro College of Engineering',
    department: 'Mechanical Engineering',
    year: '4th Year',
    student_id_number: 'ME22B3005',
    registration_id: 'COL-2026-ROBO7',
    qr_token: 'qr-col26-robo7-rahul',
    registration_data: {
      team_name: 'Apex Mecha Titans',
      team_members: ['Rahul Verma', 'Karan Johar', 'Neha Dixit'],
    },
    status: 'confirmed',
    registered_at: '2026-09-28T09:00:00.000Z',
  },
];

let state = {
  profiles: [
    {
      id: 'usr-admin-initial',
      username: 'admin',
      name: 'Festival Administrator',
      email: 'admin@colorido.fest',
      password: bcrypt.hashSync('colorido@2026', 10),
      role: 'admin',
      college: 'Festival Admin Council',
      department: 'Central Committee',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-volunteer-initial',
      username: 'volunteer',
      name: 'Festival Volunteer',
      email: 'volunteer@colorido.fest',
      password: bcrypt.hashSync('colorido@2026', 10),
      role: 'volunteer',
      college: 'Apex Institute of Technology',
      department: 'Event Operations Team',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-sandeep-initial',
      username: 'sandeep',
      name: 'Sandeep Repala',
      email: 'sandeep@colorido.fest',
      password: bcrypt.hashSync('colorido@2026', 10),
      role: 'student',
      college: 'Apex Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      student_id: 'Y23CS116',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  events: initialEvents || [],
  stalls: initialStalls || [],
  leaderboards: initialLeaderboards || [],
  discussion: (initialDiscussion || []).map((m) => ({ ...m })),
  registrations: initialRegistrations,
  certificates: [],
  stallApplications: [],
  emailLogs: [],
};

let syncPromise = null;

// Initial sync from PostgreSQL
export const syncFromPostgres = async () => {
  try {
    const [
      profilesRes,
      eventsRes,
      stallsRes,
      lbRes,
      discRes,
      regsRes,
      certsRes,
      appsRes,
      emailsRes,
    ] = await Promise.all([
      pool.query('SELECT * FROM profiles'),
      pool.query('SELECT * FROM events ORDER BY event_date ASC'),
      pool.query('SELECT * FROM stalls ORDER BY stall_id ASC'),
      pool.query('SELECT * FROM leaderboards'),
      pool.query('SELECT * FROM discussion_messages ORDER BY created_at ASC'),
      pool.query('SELECT * FROM event_registrations ORDER BY registered_at DESC'),
      pool.query('SELECT * FROM certificates ORDER BY created_at DESC'),
      pool.query('SELECT * FROM stall_applications ORDER BY submitted_at DESC'),
      pool.query('SELECT * FROM email_logs ORDER BY sent_at DESC'),
    ]);

    if (profilesRes.rows.length > 0) {
      state.profiles = profilesRes.rows;
    }

    // Ensure Postgres profiles_role_check constraint includes 'volunteer' and seed volunteer
    try {
      await pool.query(`ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;`);
      await pool.query(`ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'admin', 'volunteer'));`);
      const volHash = bcrypt.hashSync('colorido@2026', 10);
      await pool.query(`
        INSERT INTO profiles (id, username, name, email, password, role, college, department)
        VALUES ('usr-volunteer-01', 'volunteer', 'Festival Volunteer', 'volunteer@colorido.fest', $1, 'volunteer', 'Apex Institute of Technology', 'Event Operations Team')
        ON CONFLICT (username) DO UPDATE SET role = 'volunteer';
      `, [volHash]);
      const updatedProfiles = await pool.query('SELECT * FROM profiles');
      state.profiles = updatedProfiles.rows;
    } catch (e) {
      // In-memory volunteer profile fallback is always ready in state.profiles
      if (!state.profiles.some((p) => p.username === 'volunteer' || p.role === 'volunteer')) {
        state.profiles.push({
          id: 'usr-volunteer-initial',
          username: 'volunteer',
          name: 'Festival Volunteer',
          email: 'volunteer@colorido.fest',
          password: bcrypt.hashSync('colorido@2026', 10),
          role: 'volunteer',
          college: 'Apex Institute of Technology',
          department: 'Event Operations Team',
          created_at: '2026-01-01T00:00:00.000Z',
        });
      }
    }
    state.events = eventsRes.rows.map((e) => ({
      ...e,
      rounds: typeof e.rounds === 'string' ? JSON.parse(e.rounds) : (e.rounds || []),
      event_date: e.event_date ? new Date(e.event_date).toISOString().split('T')[0] : '',
      registration_deadline: e.registration_deadline ? new Date(e.registration_deadline).toISOString().split('T')[0] : '',
    }));
    state.stalls = stallsRes.rows;
    state.leaderboards = lbRes.rows.map((lb) => ({
      ...lb,
      entries: typeof lb.entries === 'string' ? JSON.parse(lb.entries) : (lb.entries || []),
    }));

    if (discRes.rows.length > 0) {
      state.discussion = discRes.rows;
    } else {
      state.discussion = (initialDiscussion || []).map((m) => ({ ...m }));
      for (const msg of state.discussion) {
        try {
          await pool.query(`
            INSERT INTO discussion_messages (id, user_id, user_name, user_role, user_dept, message, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
          `, [msg.id, msg.user_id, msg.user_name, msg.user_role || 'student', msg.user_dept || 'Festival Community', msg.message, msg.created_at || new Date().toISOString()]);
        } catch (e) {
          console.error('[Database] Error seeding initial discussion in PG:', e.message);
        }
      }
    }

    if (regsRes.rows.length > 0) {
      state.registrations = regsRes.rows.map((r) => ({
        ...r,
        registration_data: typeof r.registration_data === 'string' ? JSON.parse(r.registration_data) : (r.registration_data || {}),
      }));
    }
    state.certificates = certsRes.rows.map((c) => ({
      ...c,
      issued_date: c.issued_date ? new Date(c.issued_date).toISOString().split('T')[0] : '',
    }));
    state.stallApplications = appsRes.rows;
    state.emailLogs = emailsRes.rows;

    // Automatically ensure all sports events have an active leaderboard
    const sportsEvents = state.events.filter((e) => (e.category || '').toLowerCase() === 'sports');
    for (const ev of sportsEvents) {
      let existing = state.leaderboards.find(
        (lb) => lb.event_id === ev.id || lb.sport_name?.toLowerCase() === ev.name?.toLowerCase()
      );
      if (!existing) {
        existing = {
          id: 'lb-' + ev.id.replace(/^evt-/, ''),
          event_id: ev.id,
          sport_name: ev.name,
          status: 'UPCOMING',
          match_info: `${ev.venue || 'Sports Arena'} • Starts at ${ev.start_time || '10:00 AM'}`,
          entries: [],
          updated_at: new Date().toISOString(),
        };
        state.leaderboards.push(existing);
        try {
          await pool.query(`
            INSERT INTO leaderboards (id, event_id, sport_name, status, match_info, entries, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [
            existing.id, existing.event_id, existing.sport_name, existing.status,
            existing.match_info, JSON.stringify(existing.entries),
          ]);
        } catch (e) {
          console.error('[Database] Error auto-seeding sports leaderboard in PG:', e.message);
        }
      } else if (!existing.event_id) {
        existing.event_id = ev.id;
        try {
          await pool.query('UPDATE leaderboards SET event_id = $2 WHERE id = $1', [existing.id, ev.id]);
        } catch (e) {}
      }

      // Automatically sync confirmed registrations for this sports event into leaderboard entries
      const eventRegs = state.registrations.filter((r) => r.event_id === ev.id && r.status !== 'cancelled');
      let changed = false;
      for (const reg of eventRegs) {
        const regTeamName = reg.registration_data?.team_name?.trim() || reg.student_name || 'Participant';
        const foundEntry = existing.entries.find(
          (e) => (e.registration_id && e.registration_id === reg.id) || e.team_name?.toLowerCase() === regTeamName.toLowerCase()
        );
        if (!foundEntry) {
          let squadDesc = reg.student_name;
          const extraMembers = reg.registration_data?.team_members;
          if (Array.isArray(extraMembers) && extraMembers.length > 0) {
            const names = extraMembers.map((m) => (typeof m === 'string' ? m : m.name)).filter(Boolean);
            if (names.length > 0) squadDesc += ', ' + names.join(', ');
          } else if (reg.college) {
            squadDesc += ` (${reg.college})`;
          }

          existing.entries.push({
            id: 'lbe-' + reg.id.replace(/^reg-/, ''),
            registration_id: reg.id,
            team_name: regTeamName,
            participant_name: squadDesc,
            score: '0 pts',
            points: 0,
            rank: existing.entries.length + 1,
            form: '-',
            updated_at: reg.registered_at || new Date().toISOString(),
          });
          changed = true;
        } else if (!foundEntry.registration_id) {
          foundEntry.registration_id = reg.id;
          changed = true;
        }
      }

      if (changed) {
        existing.entries.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
        existing.entries.forEach((e, i) => { e.rank = i + 1; });
        try {
          await pool.query('UPDATE leaderboards SET entries = $2, updated_at = NOW() WHERE id = $1', [
            existing.id, JSON.stringify(existing.entries)
          ]);
        } catch (e) {
          console.error('[Database] Error syncing registrations to leaderboard in PG:', e.message);
        }
      }
    }

    console.log(`[Database] Synced from PostgreSQL: ${state.events.length} events, ${state.leaderboards.length} leaderboards, ${state.stalls.length} stalls, ${state.profiles.length} profiles.`);
  } catch (err) {
    console.error('[Database] Failed to sync from PostgreSQL:', err.message);
  }
};

// Initial run
syncPromise = syncFromPostgres();

export const ensureSynced = async () => {
  if (syncPromise) {
    try {
      await syncPromise;
    } catch (e) {}
  }
};

export const db = {
  sync: syncFromPostgres,
  ensureSynced,

  // Users / Profiles
  findUserByIdentifier: (identifier) => {
    const idf = (identifier || '').toLowerCase().trim();
    return state.profiles.find(
      (p) => p.username?.toLowerCase() === idf || p.email?.toLowerCase() === idf
    );
  },
  findUserByIdentifierAsync: async (identifier) => {
    let user = db.findUserByIdentifier(identifier);
    if (!user) {
      try {
        const idf = (identifier || '').toLowerCase().trim();
        const res = await pool.query('SELECT * FROM profiles WHERE LOWER(username) = $1 OR LOWER(email) = $1', [idf]);
        if (res.rows[0]) {
          user = res.rows[0];
          state.profiles.push(user);
        }
      } catch (e) {
        console.error('[Database] Direct user lookup error:', e.message);
      }
    }
    return user;
  },
  findUserByEmail: (email) => {
    const em = (email || '').toLowerCase().trim();
    return state.profiles.find((p) => p.email?.toLowerCase() === em || p.username?.toLowerCase() === em);
  },
  findUserById: (id) => {
    if (!id) return null;
    return state.profiles.find((p) =>
      p.id === id ||
      p.email?.toLowerCase() === String(id).toLowerCase() ||
      p.username?.toLowerCase() === String(id).toLowerCase() ||
      (String(id).includes('admin') && p.role === 'admin')
    );
  },
  createUser: async (profile) => {
    state.profiles.push(profile);
    try {
      await pool.query(`
        INSERT INTO profiles (id, username, name, email, password, phone, college, department, year, student_id, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;
      `, [
        profile.id,
        profile.username || profile.email.split('@')[0],
        profile.name,
        profile.email,
        profile.password,
        profile.phone || null,
        profile.college || null,
        profile.department || null,
        profile.year || null,
        profile.student_id || null,
        profile.role || 'student',
        profile.created_at || new Date().toISOString(),
      ]);
    } catch (e) {
      console.error('[Database] Error saving profile to PG:', e.message);
    }
    return profile;
  },
  getAllUsers: () => state.profiles,

  // Events
  getAllEvents: () => state.events,
  getEventById: (id) => state.events.find((e) => e.id === id),
  createEvent: async (eventData) => {
    state.events.unshift(eventData);
    try {
      await pool.query(`
        INSERT INTO events (
          id, name, category, description, image_url, venue, event_date,
          start_time, end_time, registration_deadline, max_participants,
          prize_pool, prize_1st, prize_2nd, prize_3rd, min_team_size, max_team_size,
          eligibility, rules, judging_criteria,
          contact_name, contact_email, contact_phone, rounds
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )
      `, [
        eventData.id,
        eventData.name,
        eventData.category,
        eventData.description,
        eventData.image_url,
        eventData.venue,
        eventData.event_date,
        eventData.start_time,
        eventData.end_time,
        eventData.registration_deadline,
        eventData.max_participants,
        eventData.prize_pool,
        eventData.prize_1st || null,
        eventData.prize_2nd || null,
        eventData.prize_3rd || null,
        Number(eventData.min_team_size) || 1,
        Number(eventData.max_team_size) || 1,
        eventData.eligibility,
        eventData.rules,
        eventData.judging_criteria,
        eventData.contact_name,
        eventData.contact_email,
        eventData.contact_phone,
        JSON.stringify(eventData.rounds || []),
      ]);
    } catch (e) {
      console.error('[Database] Error inserting event to PG:', e.message);
    }
    return eventData;
  },
  updateEvent: async (id, updates) => {
    const idx = state.events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    state.events[idx] = { ...state.events[idx], ...updates, updated_at: new Date().toISOString() };
    const e = state.events[idx];
    try {
      await pool.query(`
        UPDATE events SET
          name = $2, category = $3, description = $4, image_url = $5,
          venue = $6, event_date = $7, start_time = $8, end_time = $9,
          registration_deadline = $10, max_participants = $11, prize_pool = $12,
          prize_1st = $13, prize_2nd = $14, prize_3rd = $15,
          min_team_size = $16, max_team_size = $17,
          eligibility = $18, rules = $19, judging_criteria = $20,
          contact_name = $21, contact_email = $22, contact_phone = $23,
          rounds = $24, updated_at = NOW()
        WHERE id = $1
      `, [
        id, e.name, e.category, e.description, e.image_url, e.venue, e.event_date,
        e.start_time, e.end_time, e.registration_deadline, e.max_participants,
        e.prize_pool, e.prize_1st || null, e.prize_2nd || null, e.prize_3rd || null,
        Number(e.min_team_size) || 1, Number(e.max_team_size) || 1,
        e.eligibility, e.rules, e.judging_criteria, e.contact_name,
        e.contact_email, e.contact_phone, JSON.stringify(e.rounds || []),
      ]);
    } catch (err) {
      console.error('[Database] Error updating event in PG:', err.message);
    }
    return e;
  },
  deleteEvent: async (id) => {
    const idx = state.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    state.events.splice(idx, 1);
    try {
      await pool.query('DELETE FROM events WHERE id = $1', [id]);
    } catch (e) {
      console.error('[Database] Error deleting event from PG:', e.message);
    }
    // Also remove any linked leaderboard
    await db.deleteLeaderboard(id);
    return true;
  },

  // Registrations
  getAllRegistrations: () => state.registrations,
  getRegistrationById: (id) => state.registrations.find((r) => r.id === id || r.registration_id === id),
  getRegistrationByQrToken: (qrToken) => state.registrations.find((r) => r.qr_token === qrToken),
  getUserRegistrations: (userId) => state.registrations.filter((r) => r.student_id === userId),
  getEventRegistrations: (eventId) => state.registrations.filter((r) => r.event_id === eventId),
  createRegistration: async (r) => {
    state.registrations.push(r);
    try {
      await pool.query(`
        INSERT INTO event_registrations (
          id, event_id, event_name, event_date, start_time, venue,
          student_id, student_name, student_email, student_phone,
          college, department, year, student_id_number,
          registration_id, qr_token, registration_data, status, registered_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
      `, [
        r.id, r.event_id, r.event_name, r.event_date, r.start_time, r.venue,
        r.student_id, r.student_name, r.student_email, r.student_phone,
        r.college, r.department, r.year, r.student_id_number,
        r.registration_id, r.qr_token, JSON.stringify(r.registration_data || {}),
        r.status || 'confirmed', r.registered_at || new Date().toISOString(),
      ]);
    } catch (e) {
      console.error('[Database] Error saving registration in PG:', e.message);
    }
    return r;
  },
  cancelRegistration: async (id) => {
    const idx = state.registrations.findIndex((r) => r.id === id || r.registration_id === id);
    if (idx === -1) return null;
    state.registrations[idx].status = 'cancelled';
    try {
      await pool.query('UPDATE event_registrations SET status = $1 WHERE id = $2 OR registration_id = $2', ['cancelled', id]);
    } catch (e) {
      console.error('[Database] Error cancelling registration in PG:', e.message);
    }
    return state.registrations[idx];
  },
  updateRegistrationStatus: async (id, status, extra = {}) => {
    const idx = state.registrations.findIndex((r) => r.id === id || r.registration_id === id || r.qr_token === id);
    if (idx === -1) return null;
    state.registrations[idx].status = status;
    if (extra.checkin_time) {
      state.registrations[idx].checkin_time = extra.checkin_time;
    }
    try {
      await pool.query('UPDATE event_registrations SET status = $1 WHERE id = $2 OR registration_id = $2 OR qr_token = $2', [status, id]);
    } catch (e) {
      console.error('[Database] Error updating registration status in PG:', e.message);
    }
    return state.registrations[idx];
  },

  // Stalls
  getAllStalls: () => state.stalls,
  getStallByNumber: (stallId) => state.stalls.find((s) => s.stall_id === stallId),
  updateStall: async (stallId, updates) => {
    const idx = state.stalls.findIndex((s) => s.stall_id === stallId || s.id === stallId);
    if (idx === -1) return null;
    state.stalls[idx] = { ...state.stalls[idx], ...updates };
    const s = state.stalls[idx];
    try {
      await pool.query(`
        UPDATE stalls SET
          status = $2, applicant_name = $3, applicant_email = $4,
          item_name = $5, description = $6, price = $7
        WHERE stall_id = $1
      `, [
        s.stall_id, s.status, s.applicant_name || null, s.applicant_email || null,
        s.item_name || null, s.description || null, s.price || null,
      ]);
    } catch (e) {
      console.error('[Database] Error updating stall in PG:', e.message);
    }
    return state.stalls[idx];
  },

  // Stall Applications
  getAllStallApplications: () => state.stallApplications,
  getUserStallApplications: (userId) => state.stallApplications.filter((a) => a.student_id === userId),
  createStallApplication: async (appData) => {
    state.stallApplications.unshift(appData);
    try {
      await pool.query(`
        INSERT INTO stall_applications (
          id, stall_id, stall_number, student_id, applicant_name, applicant_email,
          applicant_phone, college, type, item_name, description, price,
          rules, requirements, manager_count, status, submitted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `, [
        appData.id, appData.stall_id, appData.stall_number || appData.stall_id,
        appData.student_id, appData.applicant_name, appData.applicant_email,
        appData.applicant_phone, appData.college, appData.type, appData.item_name,
        appData.description, appData.price, appData.rules || null,
        appData.requirements || null, appData.manager_count || 1,
        appData.status || 'pending', appData.submitted_at || new Date().toISOString(),
      ]);
    } catch (e) {
      console.error('[Database] Error inserting stall app in PG:', e.message);
    }
    return appData;
  },
  updateStallApplicationStatus: async (appId, status, rejectionReason = '') => {
    const idx = state.stallApplications.findIndex((a) => a.id === appId);
    if (idx === -1) return null;
    const app = state.stallApplications[idx];
    app.status = status;
    if (rejectionReason) app.rejection_reason = rejectionReason;
    app.reviewed_at = new Date().toISOString();

    const stallIdx = state.stalls.findIndex((s) => s.stall_id === app.stall_id);
    let updatedStall = null;

    if (stallIdx !== -1) {
      if (status === 'approved') {
        state.stalls[stallIdx].status = 'occupied';
        state.stalls[stallIdx].applicant_name = app.applicant_name;
        state.stalls[stallIdx].applicant_email = app.applicant_email;
        state.stalls[stallIdx].item_name = app.item_name;
        state.stalls[stallIdx].description = app.description;
        state.stalls[stallIdx].price = app.price;
        state.stalls[stallIdx].manager_count = app.manager_count;
        state.stalls[stallIdx].requirements = app.requirements;
        state.stalls[stallIdx].rules = app.rules || '';
      } else if (status === 'rejected') {
        const otherApproved = state.stallApplications.find(
          (a) => a.stall_id === app.stall_id && a.id !== appId && a.status === 'approved'
        );
        if (!otherApproved) {
          state.stalls[stallIdx].status = 'available';
          state.stalls[stallIdx].applicant_name = null;
          state.stalls[stallIdx].applicant_email = null;
          state.stalls[stallIdx].item_name = null;
          state.stalls[stallIdx].description = null;
          state.stalls[stallIdx].price = null;
        }
      }
      updatedStall = state.stalls[stallIdx];
    }

    try {
      await pool.query(`
        UPDATE stall_applications SET status = $2, rejection_reason = $3, reviewed_at = NOW() WHERE id = $1
      `, [appId, status, rejectionReason]);

      if (updatedStall) {
        await pool.query(`
          UPDATE stalls SET
            status = $2, applicant_name = $3, applicant_email = $4,
            item_name = $5, description = $6, price = $7
          WHERE stall_id = $1
        `, [
          updatedStall.stall_id, updatedStall.status, updatedStall.applicant_name,
          updatedStall.applicant_email, updatedStall.item_name, updatedStall.description, updatedStall.price,
        ]);
      }
    } catch (e) {
      console.error('[Database] Error updating stall application in PG:', e.message);
    }

    return { application: app, stall: updatedStall };
  },

  // Leaderboards
  getAllLeaderboards: () => {
    const sportsEvents = state.events.filter((e) => (e.category || '').toLowerCase() === 'sports');
    for (const ev of sportsEvents) {
      let existing = state.leaderboards.find(
        (lb) => lb.event_id === ev.id || lb.sport_name?.toLowerCase() === ev.name?.toLowerCase()
      );
      if (!existing) {
        existing = {
          id: 'lb-' + ev.id.replace(/^evt-/, ''),
          event_id: ev.id,
          sport_name: ev.name,
          status: 'UPCOMING',
          match_info: `${ev.venue || 'Sports Complex'} • Starts at ${ev.start_time || '10:00 AM'}`,
          entries: [],
          updated_at: new Date().toISOString(),
        };
        state.leaderboards.push(existing);
      }

      // Auto-sync confirmed registrations into existing.entries
      const eventRegs = state.registrations.filter((r) => r.event_id === ev.id && r.status !== 'cancelled');
      let changed = false;
      for (const reg of eventRegs) {
        const regTeamName = reg.registration_data?.team_name?.trim() || reg.student_name || 'Participant';
        const found = existing.entries.find(
          (e) => (e.registration_id && e.registration_id === reg.id) || e.team_name?.toLowerCase() === regTeamName.toLowerCase()
        );
        if (!found) {
          let squadDesc = reg.student_name;
          const extraMembers = reg.registration_data?.team_members;
          if (Array.isArray(extraMembers) && extraMembers.length > 0) {
            const names = extraMembers.map((m) => (typeof m === 'string' ? m : m.name)).filter(Boolean);
            if (names.length > 0) squadDesc += ', ' + names.join(', ');
          } else if (reg.college) {
            squadDesc += ` (${reg.college})`;
          }

          existing.entries.push({
            id: 'lbe-' + reg.id.replace(/^reg-/, ''),
            registration_id: reg.id,
            team_name: regTeamName,
            participant_name: squadDesc,
            score: '0 pts',
            points: 0,
            rank: existing.entries.length + 1,
            form: '-',
            updated_at: reg.registered_at || new Date().toISOString(),
          });
          changed = true;
        } else if (!found.registration_id) {
          found.registration_id = reg.id;
          changed = true;
        }
      }
      if (changed) {
        existing.entries.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
        existing.entries.forEach((e, i) => { e.rank = i + 1; });
      }
    }
    return state.leaderboards;
  },
  getLeaderboardByEventId: (eventId) => state.leaderboards.find((lb) => lb.event_id === eventId || lb.id === eventId),
  deleteLeaderboard: async (id) => {
    const idx = state.leaderboards.findIndex((lb) => lb.id === id || lb.event_id === id);
    if (idx === -1) return false;
    const removed = state.leaderboards.splice(idx, 1)[0];
    try {
      await pool.query('DELETE FROM leaderboards WHERE id = $1 OR event_id = $2', [removed.id, id]);
    } catch (e) {
      console.error('[Database] Error deleting leaderboard from PG:', e.message);
    }
    return true;
  },
  createLeaderboard: async (lbData) => {
    state.leaderboards.push(lbData);
    try {
      await pool.query(`
        INSERT INTO leaderboards (id, event_id, sport_name, status, match_info, entries, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        lbData.id, lbData.event_id, lbData.sport_name, lbData.status || 'UPCOMING',
        lbData.match_info || '', JSON.stringify(lbData.entries || []),
      ]);
    } catch (e) {
      console.error('[Database] Error creating leaderboard in PG:', e.message);
    }
    return lbData;
  },
  updateLeaderboardStatus: async (id, status, matchInfo) => {
    const idx = state.leaderboards.findIndex((lb) => lb.id === id || lb.event_id === id);
    if (idx === -1) return null;
    if (status) state.leaderboards[idx].status = status;
    if (matchInfo) state.leaderboards[idx].match_info = matchInfo;
    const board = state.leaderboards[idx];
    try {
      await pool.query('UPDATE leaderboards SET status = $2, match_info = $3, updated_at = NOW() WHERE id = $1', [board.id, board.status, board.match_info]);
    } catch (e) {
      console.error('[Database] Error updating leaderboard status in PG:', e.message);
    }
    return board;
  },
  updateLeaderboardEntry: async (boardId, entryData) => {
    let idx = state.leaderboards.findIndex((lb) => lb.id === boardId || lb.event_id === boardId);
    if (idx === -1) {
      const ev = state.events.find((e) => e.id === boardId);
      if (ev) {
        const newLb = {
          id: 'lb-' + ev.id.replace(/^evt-/, ''),
          event_id: ev.id,
          sport_name: ev.name,
          status: 'UPCOMING',
          match_info: `${ev.venue || 'Sports Complex'} • Starts at ${ev.start_time || '10:00 AM'}`,
          entries: [],
          updated_at: new Date().toISOString(),
        };
        state.leaderboards.push(newLb);
        idx = state.leaderboards.length - 1;
      } else {
        return null;
      }
    }
    const board = state.leaderboards[idx];
    const entryIdx = board.entries.findIndex(
      (e) => (entryData.id && e.id === entryData.id) ||
             (entryData.registration_id && e.registration_id === entryData.registration_id) ||
             (entryData.team_name && e.team_name?.toLowerCase() === entryData.team_name?.toLowerCase())
    );
    if (entryIdx !== -1) {
      board.entries[entryIdx] = { ...board.entries[entryIdx], ...entryData };
    } else {
      board.entries.push({
        id: entryData.id || ('lbe-' + Date.now().toString(36)),
        ...entryData,
      });
    }
    board.entries.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
    board.entries.forEach((e, i) => {
      e.rank = i + 1;
    });
    try {
      await pool.query('UPDATE leaderboards SET entries = $2, updated_at = NOW() WHERE id = $1', [board.id, JSON.stringify(board.entries)]);
    } catch (e) {
      console.error('[Database] Error updating leaderboard entry in PG:', e.message);
    }
    return board;
  },
  deleteLeaderboardEntry: async (boardId, entryId) => {
    const idx = state.leaderboards.findIndex((lb) => lb.id === boardId || lb.event_id === boardId);
    if (idx === -1) return null;
    const board = state.leaderboards[idx];
    board.entries = board.entries.filter((e) => e.id !== entryId);
    board.entries.forEach((e, i) => {
      e.rank = i + 1;
    });
    try {
      await pool.query('UPDATE leaderboards SET entries = $2, updated_at = NOW() WHERE id = $1', [board.id, JSON.stringify(board.entries)]);
    } catch (e) {
      console.error('[Database] Error deleting leaderboard entry in PG:', e.message);
    }
    return board;
  },
  adjustLeaderboardPoints: async (boardId, entryId, { delta, points, score }) => {
    const idx = state.leaderboards.findIndex((lb) => lb.id === boardId || lb.event_id === boardId);
    if (idx === -1) return null;
    const board = state.leaderboards[idx];
    const entryIdx = board.entries.findIndex((e) => e.id === entryId);
    if (entryIdx === -1) return null;

    if (delta !== undefined) {
      board.entries[entryIdx].points = Math.max(0, (Number(board.entries[entryIdx].points) || 0) + Number(delta));
    } else if (points !== undefined) {
      board.entries[entryIdx].points = Math.max(0, Number(points) || 0);
    }

    if (score !== undefined && score !== null) {
      board.entries[entryIdx].score = score.toString();
    }

    board.entries[entryIdx].updated_at = new Date().toISOString();
    board.entries.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
    board.entries.forEach((e, i) => {
      e.rank = i + 1;
    });

    try {
      await pool.query('UPDATE leaderboards SET entries = $2, updated_at = NOW() WHERE id = $1', [board.id, JSON.stringify(board.entries)]);
    } catch (e) {
      console.error('[Database] Error adjusting leaderboard points in PG:', e.message);
    }
    return board;
  },

  // Discussion
  getAllDiscussionAsync: async () => {
    try {
      const res = await pool.query('SELECT * FROM discussion_messages ORDER BY created_at ASC');
      if (res.rows.length > 0) {
        state.discussion = res.rows;
      }
      return state.discussion;
    } catch (e) {
      console.error('[Database] Error fetching discussion from PG:', e.message);
      return state.discussion;
    }
  },
  getAllDiscussion: () => state.discussion,
  addDiscussionMessage: async (msg) => {
    state.discussion.push(msg);
    try {
      await pool.query(`
        INSERT INTO discussion_messages (id, user_id, user_name, user_role, user_dept, message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          message = EXCLUDED.message,
          created_at = EXCLUDED.created_at
      `, [msg.id, msg.user_id, msg.user_name, msg.user_role || 'student', msg.user_dept || 'Festival Community', msg.message, msg.created_at || new Date().toISOString()]);
    } catch (e) {
      console.error('[Database] Error adding discussion message in PG:', e.message);
    }
    return msg;
  },
  deleteDiscussionMessage: async (id) => {
    const idx = state.discussion.findIndex((m) => m.id === id);
    if (idx !== -1) {
      state.discussion.splice(idx, 1);
    }
    try {
      await pool.query('DELETE FROM discussion_messages WHERE id = $1', [id]);
    } catch (e) {
      console.error('[Database] Error deleting discussion message in PG:', e.message);
    }
    return true;
  },

  // Certificates
  getAllCertificates: () => state.certificates,
  getUserCertificates: (userId, userEmail) => {
    return state.certificates.filter(
      (c) => c.participant_email?.toLowerCase() === userEmail?.toLowerCase()
    );
  },
  getCertificateById: (id) => {
    return state.certificates.find(
      (c) => c.certificate_id.toLowerCase() === id.toLowerCase() || c.id === id
    );
  },
  createCertificate: async (cert) => {
    state.certificates.push(cert);
    try {
      await pool.query(`
        INSERT INTO certificates (
          id, certificate_id, registration_id, event_id, event_name,
          participant_name, participant_email, achievement, issued_date,
          organizer_signature, sent_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `, [
        cert.id, cert.certificate_id, cert.registration_id, cert.event_id,
        cert.event_name, cert.participant_name, cert.participant_email,
        cert.achievement, cert.issued_date, cert.organizer_signature,
        cert.sent_at, cert.created_at,
      ]);
    } catch (e) {
      console.error('[Database] Error inserting certificate in PG:', e.message);
    }
    return cert;
  },

  // Email Logs
  getAllEmailLogs: () => state.emailLogs,
  getUserEmailLogs: (userEmail) => {
    return state.emailLogs.filter((e) => (e.to_email || e.to)?.toLowerCase() === userEmail?.toLowerCase());
  },
  addEmailLog: async (emailRecord) => {
    state.emailLogs.unshift(emailRecord);
    try {
      await pool.query(`
        INSERT INTO email_logs (id, to_email, recipient_name, event_id, event_name, subject, body_snippet, html, type, sent_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        emailRecord.id, emailRecord.to || emailRecord.to_email, emailRecord.recipient_name,
        emailRecord.event_id, emailRecord.event_name, emailRecord.subject,
        emailRecord.body_snippet, emailRecord.html, emailRecord.type,
        emailRecord.sent_at, emailRecord.status,
      ]);
    } catch (e) {
      console.error('[Database] Error saving email log in PG:', e.message);
    }
    return emailRecord;
  },
};
