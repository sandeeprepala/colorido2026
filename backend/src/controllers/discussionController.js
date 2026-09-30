import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';
import { broadcastRealtime } from '../services/realtimeService.js';

export const getDiscussion = async (req, res) => {
  try {
    const messages = await db.getAllDiscussionAsync();
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve discussion messages.' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const newMsg = {
      id: 'msg-' + uuidv4(),
      user_id: user.id || null,
      user_name: user.name || 'Anonymous User',
      user_role: user.role || 'user',
      user_dept: user.department || 'Festival Member',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    await db.addDiscussionMessage(newMsg);

    // Broadcast instant update
    broadcastRealtime('DISCUSSION_MESSAGE_ADDED', newMsg);

    return res.status(201).json({ message: 'Message sent!', data: newMsg });
  } catch (err) {
    console.error('postMessage error:', err);
    return res.status(500).json({ error: 'Failed to post message.' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteDiscussionMessage(id);
    if (!success) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    broadcastRealtime('DISCUSSION_MESSAGE_DELETED', { id });
    return res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete message.' });
  }
};
