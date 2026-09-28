import { db } from '../data/db.js';
import { broadcastRealtime } from '../services/realtimeService.js';

export const getAllLeaderboards = async (req, res) => {
  try {
    const leaderboards = db.getAllLeaderboards();
    return res.json({ leaderboards });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve leaderboards.' });
  }
};

export const getLeaderboardByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const board = db.getLeaderboardByEventId(eventId);
    if (!board) {
      return res.status(404).json({ error: 'Leaderboard not found for this event.' });
    }
    return res.json({ leaderboard: board });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve leaderboard.' });
  }
};

export const updateLeaderboardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, match_info } = req.body;

    const updated = db.updateLeaderboardStatus(id, status, match_info);
    if (!updated) {
      return res.status(404).json({ error: 'Leaderboard not found.' });
    }

    // Broadcast instant update
    broadcastRealtime('LEADERBOARD_UPDATED', updated);
    return res.json({ message: 'Leaderboard status updated!', leaderboard: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update leaderboard status.' });
  }
};

export const saveLeaderboardEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { entryId, team_name, participant_name, score, points, form } = req.body;

    if (!team_name || score === undefined) {
      return res.status(400).json({ error: 'Team name and score are required.' });
    }

    const updatedBoard = await db.updateLeaderboardEntry(id, {
      id: entryId,
      team_name: team_name.trim(),
      participant_name: participant_name ? participant_name.trim() : '',
      score: score.toString(),
      points: Number(points) || 0,
      form: form || 'W',
      updated_at: new Date().toISOString(),
    });

    if (!updatedBoard) {
      return res.status(404).json({ error: 'Leaderboard not found.' });
    }

    // Broadcast instant update to all connected clients
    broadcastRealtime('LEADERBOARD_UPDATED', updatedBoard);
    return res.json({ message: 'Leaderboard score updated!', leaderboard: updatedBoard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update leaderboard entry.' });
  }
};

export const adjustLeaderboardPoints = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const { delta, points, score } = req.body;

    const updatedBoard = await db.adjustLeaderboardPoints(id, entryId, { delta, points, score });
    if (!updatedBoard) {
      return res.status(404).json({ error: 'Leaderboard or team entry not found.' });
    }

    broadcastRealtime('LEADERBOARD_UPDATED', updatedBoard);
    return res.json({ message: 'Leaderboard points updated!', leaderboard: updatedBoard });
  } catch (err) {
    console.error('adjustLeaderboardPoints error:', err);
    return res.status(500).json({ error: 'Failed to adjust points.' });
  }
};

export const deleteLeaderboardEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const updatedBoard = await db.deleteLeaderboardEntry(id, entryId);
    if (!updatedBoard) {
      return res.status(404).json({ error: 'Leaderboard not found.' });
    }

    broadcastRealtime('LEADERBOARD_UPDATED', updatedBoard);
    return res.json({ message: 'Entry removed.', leaderboard: updatedBoard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete entry.' });
  }
};

export const createLeaderboard = async (req, res) => {
  try {
    const { sport_name, event_id, match_info, status } = req.body;
    if (!sport_name) {
      return res.status(400).json({ error: 'Sport/Competition name is required.' });
    }

    const newLb = {
      id: 'lb-' + Date.now().toString(36),
      event_id: event_id || null,
      sport_name: sport_name.trim(),
      status: status || 'UPCOMING',
      match_info: match_info || 'Upcoming Match',
      entries: [],
      updated_at: new Date().toISOString(),
    };

    await db.createLeaderboard(newLb);
    broadcastRealtime('LEADERBOARD_UPDATED', newLb);

    return res.status(201).json({ message: 'Leaderboard created successfully!', leaderboard: newLb });
  } catch (err) {
    console.error('createLeaderboard error:', err);
    return res.status(500).json({ error: 'Failed to create leaderboard.' });
  }
};

