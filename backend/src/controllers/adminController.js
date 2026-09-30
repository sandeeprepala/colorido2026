import { db } from '../data/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const users = db.getAllUsers();
    const events = db.getAllEvents();
    const registrations = db.getAllRegistrations();
    const stalls = db.getAllStalls();
    const stallApps = db.getAllStallApplications();

    const students = users.filter((u) => u.role === 'user' || u.role === 'student');
    const confirmedRegs = registrations.filter((r) => r.status === 'confirmed');
    const approvedStalls = stalls.filter((s) => s.status === 'occupied');
    const pendingStallApps = stallApps.filter((a) => a.status === 'pending');

    const recentRegistrations = [...registrations]
      .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
      .slice(0, 6);

    const recentStallApps = [...stallApps]
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .slice(0, 6);

    return res.json({
      stats: {
        total_students: students.length,
        total_events: events.length,
        total_registrations: confirmedRegs.length,
        total_stalls: stalls.length,
        stall_applications: stallApps.length,
        approved_stalls: approvedStalls.length,
        pending_applications: pendingStallApps.length,
      },
      recent_registrations: recentRegistrations,
      recent_stall_applications: recentStallApps,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin dashboard stats.' });
  }
};
