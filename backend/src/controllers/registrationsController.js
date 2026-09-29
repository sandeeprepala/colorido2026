import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';
import { sendRegistrationEmail } from '../services/emailService.js';
import { broadcastRealtime } from '../services/realtimeService.js';

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = req.user;
    const {
      name,
      email,
      phone,
      college,
      department,
      year,
      student_id,
      team_name,
      team_members,
      custom_fields,
    } = req.body;

    const event = db.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // 1. Check registration deadline
    const today = new Date().toISOString().split('T')[0];
    if (event.registration_deadline && event.registration_deadline < today) {
      return res.status(400).json({ error: 'Registration deadline has passed for this event.' });
    }

    // 2. Check duplicate registration
    const userRegs = db.getUserRegistrations(user.id);
    const existing = userRegs.find(
      (r) => r.event_id === eventId && r.status !== 'cancelled'
    );
    if (existing) {
      return res.status(400).json({
        error: 'You have already registered for this event.',
        registration: existing,
      });
    }

    // 3. Check capacity
    const eventRegs = db.getEventRegistrations(eventId).filter((r) => r.status !== 'cancelled');
    if (event.max_participants && eventRegs.length >= event.max_participants) {
      return res.status(400).json({ error: 'Event has reached maximum participant capacity.' });
    }

    // 4. Validate Team Size & Rules
    const minTeam = Math.max(1, Number(event.min_team_size) || 1);
    const maxTeam = Math.max(minTeam, Number(event.max_team_size) || minTeam);

    let parsedMembers = [];
    if (Array.isArray(team_members)) {
      parsedMembers = team_members.filter((m) => {
        if (!m) return false;
        if (typeof m === 'string') return m.trim().length > 0;
        return (m.name && m.name.trim().length > 0);
      });
    }

    // Total team size is the registrant (leader) + extra members
    const totalTeamSize = 1 + parsedMembers.length;

    if (maxTeam === 1) {
      // Solo event
      if (parsedMembers.length > 0) {
        return res.status(400).json({
          error: `"${event.name}" is a Solo event (1 participant only). Additional team members are not permitted.`,
        });
      }
    } else {
      // Team event
      if (!team_name || !team_name.trim()) {
        return res.status(400).json({
          error: `A Team Name is required for "${event.name}". Required team size: ${minTeam} to ${maxTeam} members.`,
        });
      }

      if (totalTeamSize < minTeam) {
        return res.status(400).json({
          error: `Minimum team size required for "${event.name}" is ${minTeam} members (including yourself). Currently specified: ${totalTeamSize}.`,
        });
      }

      if (totalTeamSize > maxTeam) {
        return res.status(400).json({
          error: `Maximum team size allowed for "${event.name}" is ${maxTeam} members (including yourself). Currently specified: ${totalTeamSize}.`,
        });
      }
    }

    // Generate unique Registration ID & secure QR verification token
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registrationId = `COL-2026-${randomHex}`;
    const qrToken = `qr-${uuidv4()}`;

    const newRegistration = {
      id: 'reg-' + uuidv4(),
      event_id: event.id,
      event_name: event.name,
      event_date: event.event_date,
      start_time: event.start_time,
      venue: event.venue,
      student_id: user.id,
      student_name: (name || user.name || '').trim(),
      student_email: (email || user.email || '').trim().toLowerCase(),
      student_phone: phone || user.phone || '',
      college: college || user.college || '',
      department: department || user.department || '',
      year: year || user.year || '',
      student_id_number: student_id || user.student_id || '',
      registration_id: registrationId,
      qr_token: qrToken,
      registration_data: {
        team_name: maxTeam > 1 ? team_name.trim() : '',
        team_size: totalTeamSize,
        team_members: parsedMembers,
        custom_fields: custom_fields || {},
      },
      status: 'confirmed',
      registered_at: new Date().toISOString(),
    };

    await db.createRegistration(newRegistration);

    // If it's a sports event, automatically add the registered team to the sports leaderboard
    if (event.category?.toLowerCase() === 'sports') {
      const regTeamName = newRegistration.registration_data?.team_name?.trim() || newRegistration.student_name || 'Participant';
      let squadDesc = newRegistration.student_name;
      const extraMembers = newRegistration.registration_data?.team_members;
      if (Array.isArray(extraMembers) && extraMembers.length > 0) {
        const names = extraMembers.map((m) => (typeof m === 'string' ? m : m.name)).filter(Boolean);
        if (names.length > 0) {
          squadDesc += ', ' + names.join(', ');
        }
      } else if (newRegistration.college) {
        squadDesc += ` (${newRegistration.college})`;
      }

      const teamEntry = {
        id: 'lbe-' + newRegistration.id.replace(/^reg-/, ''),
        registration_id: newRegistration.id,
        team_name: regTeamName,
        participant_name: squadDesc,
        score: '0 pts',
        points: 0,
        form: '-',
        updated_at: newRegistration.registered_at || new Date().toISOString(),
      };

      const updatedBoard = await db.updateLeaderboardEntry(event.id, teamEntry);
      if (updatedBoard) {
        broadcastRealtime('LEADERBOARD_UPDATED', updatedBoard);
      }
    }

    // Send confirmation email
    sendRegistrationEmail(newRegistration, event).catch((err) =>
      console.warn('Registration email background error:', err.message)
    );

    return res.status(201).json({
      message: 'Registration successful!',
      registration: newRegistration,
      event: {
        id: event.id,
        name: event.name,
        venue: event.venue,
        event_date: event.event_date,
        start_time: event.start_time,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to process event registration.' });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = db.getUserRegistrations(req.user.id);
    const events = db.getAllEvents();
    const certificates = db.getUserCertificates(req.user.id, req.user.email);

    const enriched = registrations.map((reg) => {
      const event = events.find((e) => e.id === reg.event_id) || {};
      const cert = certificates.find((c) => c.registration_id === reg.id || c.event_id === reg.event_id);
      return {
        ...reg,
        event_details: event,
        has_certificate: !!cert,
        certificate: cert || null,
      };
    });

    return res.json({ registrations: enriched });
  } catch (err) {
    console.error('getMyRegistrations error:', err);
    return res.status(500).json({ error: 'Failed to fetch your registrations.' });
  }
};

export const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = db.getRegistrationById(id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // Check authorization: must be the participant, volunteer, or admin
    if (req.user.role !== 'admin' && req.user.role !== 'volunteer' && reg.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this registration.' });
    }

    const event = db.getEventById(reg.event_id);
    return res.json({ registration: reg, event });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch registration.' });
  }
};

/**
 * Public QR Verification endpoint
 * Accessed when someone scans the registration QR code
 */
export const verifyQrToken = async (req, res) => {
  try {
    const { token } = req.params;
    const reg = db.getRegistrationByQrToken(token) || db.getRegistrationById(token);

    if (!reg) {
      return res.status(404).json({
        verified: false,
        error: 'Invalid QR code. No festival registration matches this token.',
      });
    }

    const event = db.getEventById(reg.event_id);

    return res.json({
      verified: true,
      status: reg.status,
      participant_name: reg.student_name,
      student_email: reg.student_email,
      college: reg.college,
      department: reg.department,
      registration_id: reg.registration_id,
      event_name: reg.event_name,
      event_date: event?.event_date || reg.event_date,
      venue: event?.venue || reg.venue,
      start_time: event?.start_time || reg.start_time,
      team_name: reg.registration_data?.team_name || null,
      team_members: reg.registration_data?.team_members || [],
      registered_at: reg.registered_at,
    });
  } catch (err) {
    return res.status(500).json({ verified: false, error: 'Verification error occurred.' });
  }
};

export const getAdminRegistrations = async (req, res) => {
  try {
    const { eventId, search, status } = req.query;
    let registrations = db.getAllRegistrations();

    if (eventId && eventId !== 'all') {
      registrations = registrations.filter((r) => r.event_id === eventId);
    }

    if (status && status !== 'all') {
      registrations = registrations.filter((r) => r.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      registrations = registrations.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_email.toLowerCase().includes(q) ||
          r.registration_id.toLowerCase().includes(q) ||
          r.college.toLowerCase().includes(q) ||
          r.event_name.toLowerCase().includes(q)
      );
    }

    return res.json({ registrations });
  } catch (err) {
    console.error('getAdminRegistrations error:', err);
    return res.status(500).json({ error: 'Failed to retrieve registrations.' });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = db.getRegistrationById(id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    if (req.user.role !== 'admin' && reg.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this registration.' });
    }

    const cancelled = db.cancelRegistration(id);
    return res.json({ message: 'Registration cancelled.', registration: cancelled });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel registration.' });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'attended', 'cancelled'

    if (!['confirmed', 'attended', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed, attended, or cancelled.' });
    }

    const updated = await db.updateRegistrationStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    return res.json({ message: `Registration status updated to ${status}.`, registration: updated });
  } catch (err) {
    console.error('updateRegistrationStatus error:', err);
    return res.status(500).json({ error: 'Failed to update registration status.' });
  }
};
