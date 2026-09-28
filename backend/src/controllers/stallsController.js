import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';
import { sendStallStatusEmail } from '../services/emailService.js';
import { broadcastRealtime } from '../services/realtimeService.js';

export const getStalls = async (req, res) => {
  try {
    const stalls = db.getAllStalls();
    const applications = db.getAllStallApplications();

    // Check if requester is logged in
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.role === 'admin' : false;

    const enriched = stalls.map((stall) => {
      // Find pending or approved applications for this stall
      const stallApps = applications.filter((a) => a.stall_id === stall.stall_id);
      const isMyApplication = userId ? stallApps.some((a) => a.student_id === userId) : false;

      // Sanitized stall data for students/public
      return {
        ...stall,
        is_my_application: isMyApplication,
        // Hide applicant personal details unless admin or occupant
        applicant_email: isAdmin ? stall.applicant_email : undefined,
        applicant_name: isAdmin || stall.status === 'occupied' ? stall.applicant_name : undefined,
      };
    });

    return res.json({ stalls: enriched });
  } catch (err) {
    console.error('getStalls error:', err);
    return res.status(500).json({ error: 'Failed to retrieve stalls.' });
  }
};

export const applyForStall = async (req, res) => {
  try {
    const user = req.user;
    const {
      stall_id,
      type,
      item_name,
      description,
      price,
      rules,
      requirements,
      manager_count,
      applicant_name,
      applicant_phone,
      college,
    } = req.body;

    if (!stall_id || !item_name || !price) {
      return res.status(400).json({ error: 'Stall ID, item/game name, and pricing are required.' });
    }

    const stall = db.getStallByNumber(stall_id);
    if (!stall) {
      return res.status(404).json({ error: `Stall ${stall_id} not found.` });
    }

    // Check if stall is already occupied or unavailable
    if (stall.status === 'occupied' || stall.status === 'unavailable') {
      return res.status(400).json({
        error: `Stall ${stall_id} is already occupied or unavailable. Please choose an available stall lot.`,
      });
    }

    // Check if user already has an active pending/approved application for THIS stall
    const userApps = db.getUserStallApplications(user.id);
    const existingForStall = userApps.find(
      (a) => a.stall_id === stall_id && (a.status === 'pending' || a.status === 'approved')
    );
    if (existingForStall) {
      return res.status(400).json({
        error: `You already have an active application (${existingForStall.status.toUpperCase()}) for Stall ${stall_id}.`,
      });
    }

    const newApplication = {
      id: 'app-' + uuidv4(),
      stall_id: stall.stall_id,
      stall_number: stall.stall_id,
      student_id: user.id,
      applicant_name: (applicant_name || user.name || '').trim(),
      applicant_email: user.email.toLowerCase(),
      applicant_phone: applicant_phone || user.phone || '',
      college: college || user.college || '',
      type: (type || stall.type).toLowerCase(),
      item_name: item_name.trim(),
      description: description || '',
      price: price.trim(),
      rules: rules || '',
      requirements: requirements || '',
      manager_count: Number(manager_count) || 2,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    db.createStallApplication(newApplication);

    // Update stall status to 'pending' if it was available
    if (stall.status === 'available') {
      db.updateStall(stall.stall_id, { status: 'pending' });
    }

    // Broadcast realtime update
    broadcastRealtime('STALL_UPDATED', { stall_id: stall.stall_id, status: 'pending' });

    return res.status(201).json({
      message: `Your application for Stall ${stall.stall_id} has been submitted for admin approval!`,
      application: newApplication,
    });
  } catch (err) {
    console.error('applyForStall error:', err);
    return res.status(500).json({ error: 'Failed to submit stall application.' });
  }
};

export const getMyStallApplications = async (req, res) => {
  try {
    const apps = db.getUserStallApplications(req.user.id);
    return res.json({ applications: apps });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve your stall applications.' });
  }
};

export const getAllStallApplications = async (req, res) => {
  try {
    const apps = db.getAllStallApplications();
    const stalls = db.getAllStalls();
    const enriched = apps.map((a) => {
      const stall = stalls.find((s) => s.stall_id === a.stall_id);
      return {
        ...a,
        stall_info: stall || null,
      };
    });
    return res.json({ applications: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stall applications.' });
  }
};

export const reviewStallApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject".' });
    }

    const apps = db.getAllStallApplications();
    const app = apps.find((a) => a.id === id);
    if (!app) {
      return res.status(404).json({ error: 'Stall application not found.' });
    }

    const stall = db.getStallByNumber(app.stall_id);
    if (!stall) {
      return res.status(404).json({ error: 'Target stall does not exist.' });
    }

    // Atomic business rule: prevent two students from occupying the same stall
    if (action === 'approve' && stall.status === 'occupied') {
      return res.status(400).json({
        error: `Stall ${stall.stall_id} is already occupied by another approved applicant. You cannot approve multiple applications for the same stall.`,
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const result = db.updateStallApplicationStatus(id, newStatus, rejection_reason);

    // Send status update email automatically
    sendStallStatusEmail(app, stall, action === 'approve', rejection_reason).catch((err) =>
      console.warn('Stall status email background error:', err.message)
    );

    // Broadcast realtime update to all connected clients
    broadcastRealtime('STALL_UPDATED', {
      stall_id: stall.stall_id,
      status: action === 'approve' ? 'occupied' : 'available',
    });

    return res.json({
      message: `Stall application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      result,
    });
  } catch (err) {
    console.error('reviewStallApplication error:', err);
    return res.status(500).json({ error: 'Failed to review stall application.' });
  }
};

export const updateStallAdmin = async (req, res) => {
  try {
    const { stallId } = req.params;
    const { status, name, section, price } = req.body;
    const updated = db.updateStall(stallId, { status, name, section, price });
    if (!updated) {
      return res.status(404).json({ error: 'Stall not found.' });
    }

    broadcastRealtime('STALL_UPDATED', { stall_id: stallId, status: updated.status });
    return res.json({ message: 'Stall updated successfully.', stall: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update stall.' });
  }
};
