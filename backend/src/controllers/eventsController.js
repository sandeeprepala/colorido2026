import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';

export const getEvents = async (req, res) => {
  try {
    let events = db.getAllEvents();
    const { category, search, date, venue } = req.query;

    if (category && category !== 'all') {
      events = events.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    if (date) {
      events = events.filter((e) => e.event_date === date);
    }

    if (venue) {
      events = events.filter((e) => e.venue.toLowerCase().includes(venue.toLowerCase()));
    }

    // Attach participant counts
    const registrations = db.getAllRegistrations();
    const enriched = events.map((event) => {
      const confirmedRegs = registrations.filter(
        (r) => r.event_id === event.id && r.status !== 'cancelled'
      );
      return {
        ...event,
        registered_count: confirmedRegs.length,
        is_full: confirmedRegs.length >= (event.max_participants || 100),
      };
    });

    return res.json({ events: enriched });
  } catch (err) {
    console.error('getEvents error:', err);
    return res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = db.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const registrations = db.getAllRegistrations().filter(
      (r) => r.event_id === event.id && r.status !== 'cancelled'
    );

    let isUserRegistered = false;
    let userRegistration = null;
    if (req.user) {
      userRegistration = registrations.find((r) => r.student_id === req.user.id);
      isUserRegistered = !!userRegistration;
    }

    return res.json({
      event: {
        ...event,
        registered_count: registrations.length,
        is_full: registrations.length >= (event.max_participants || 100),
        is_registered: isUserRegistered,
        user_registration: userRegistration,
      },
    });
  } catch (err) {
    console.error('getEventById error:', err);
    return res.status(500).json({ error: 'Failed to fetch event details.' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      image_url,
      venue,
      event_date,
      start_time,
      end_time,
      registration_deadline,
      max_participants,
      prize_pool,
      prize_1st,
      prize_2nd,
      prize_3rd,
      min_team_size,
      max_team_size,
      eligibility,
      rules,
      judging_criteria,
      contact_name,
      contact_email,
      contact_phone,
      rounds,
    } = req.body;

    if (!name || !category || !venue || !event_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Event name, category, venue, date, and times are required.' });
    }

    const minTeam = Math.max(1, Number(min_team_size) || 1);
    const maxTeam = Math.max(minTeam, Number(max_team_size) || minTeam);

    const newEvent = {
      id: 'evt-' + Date.now().toString(36),
      name: name.trim(),
      category: category.toLowerCase(),
      description: description || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      venue: venue.trim(),
      event_date,
      start_time,
      end_time,
      registration_deadline: registration_deadline || event_date,
      max_participants: Number(max_participants) || 100,
      prize_pool: prize_pool || 'Trophies & Certificates',
      prize_1st: prize_1st || '',
      prize_2nd: prize_2nd || '',
      prize_3rd: prize_3rd || '',
      min_team_size: minTeam,
      max_team_size: maxTeam,
      eligibility: eligibility || 'Open to all registered students',
      rules: rules || 'Festival guidelines apply',
      judging_criteria: judging_criteria || 'Jury decision will be final',
      contact_name: contact_name || 'Event Coordinator',
      contact_email: contact_email || 'events@colorido.fest',
      contact_phone: contact_phone || '+91 99999 00000',
      rounds: Array.isArray(rounds) ? rounds : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createEvent(newEvent);
    return res.status(201).json({ message: 'Event created successfully!', event: newEvent });
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateEvent(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    return res.json({ message: 'Event updated successfully!', event: updated });
  } catch (err) {
    console.error('updateEvent error:', err);
    return res.status(500).json({ error: 'Failed to update event.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteEvent(id);
    if (!success) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    return res.json({ message: 'Event cancelled/deleted successfully.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
};
