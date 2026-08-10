const db = require('../config/db');
const { v4: uuidv4 } = require('crypto');

// Helper to wrap db.all in a promise
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to wrap db.run in a promise
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Fetch message history for a room
exports.getMessages = async (req, res) => {
  try {
    const room = req.query.room || 'general';
    const limit = parseInt(req.query.limit) || 50;

    const rows = await dbAll(
      `SELECT * FROM messages WHERE room = ? ORDER BY created_at ASC LIMIT ?`,
      [room, limit]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ success: false, error: 'Server error while fetching messages' });
  }
};

// Send message via REST API
exports.sendMessage = async (req, res) => {
  try {
    const { room = 'general', sender_id, sender_name, sender_avatar, content, type = 'text' } = req.body;

    if (!sender_id || !sender_name || !content) {
      return res.status(400).json({ success: false, error: 'Missing required message fields' });
    }

    const messageId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const timestamp = new Date().toISOString();

    await dbRun(
      `INSERT INTO messages (id, room, sender_id, sender_name, sender_avatar, content, type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?)`,
      [messageId, room, sender_id, sender_name, sender_avatar || '', content, type, timestamp]
    );

    const newMessage = {
      id: messageId,
      room,
      sender_id,
      sender_name,
      sender_avatar: sender_avatar || '',
      content,
      type,
      status: 'sent',
      created_at: timestamp
    };

    // Emit via Socket.io if attached to app
    const io = req.app.get('socketio');
    if (io) {
      io.to(room).emit('receive_message', newMessage);
    }

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (err) {
    console.error('Error saving message:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

// Get available rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await dbAll(`SELECT * FROM rooms`);
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
  }
};
