const db = require('../config/db');

// In-memory mapping of active socket connections
const activeSockets = new Map(); // socketId -> user Object
const userSocketCount = new Map(); // userId -> count

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User identification / login on socket connection
    socket.on('user_join', async (userData) => {
      if (!userData || !userData.id) return;

      activeSockets.set(socket.id, userData);
      const count = (userSocketCount.get(userData.id) || 0) + 1;
      userSocketCount.set(userData.id, count);

      socket.userId = userData.id;
      socket.username = userData.username;

      // Update online status in DB
      try {
        await dbRun(`UPDATE users SET status = 'online', last_seen = CURRENT_TIMESTAMP WHERE id = ?`, [userData.id]);
        const users = await dbAll(`SELECT id, username, avatar, status, last_seen FROM users`);
        io.emit('user_status_change', { userId: userData.id, status: 'online', users });
      } catch (err) {
        console.error('Failed to update user online status:', err.message);
      }
    });

    // Join channel / room
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.username || socket.id} joined room: ${room}`);
    });

    // Leave room
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.username || socket.id} left room: ${room}`);
    });

    // Real-time Message Broadcasting
    socket.on('send_message', async (data) => {
      try {
        const { room = 'general', sender_id, sender_name, sender_avatar, content, type = 'text' } = data;

        if (!sender_id || !content) return;

        const messageId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const timestamp = new Date().toISOString();

        // Persist message in SQLite database
        await dbRun(
          `INSERT INTO messages (id, room, sender_id, sender_name, sender_avatar, content, type, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?)`,
          [messageId, room, sender_id, sender_name, sender_avatar || '', content, type, timestamp]
        );

        const savedMessage = {
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

        // Broadcast to all clients in the room (including sender or to others depending on design)
        io.to(room).emit('receive_message', savedMessage);
      } catch (err) {
        console.error('Socket send_message error:', err.message);
        socket.emit('error_message', { error: 'Failed to deliver message' });
      }
    });

    // Typing Indicators
    socket.on('typing_start', (data) => {
      const { room, username } = data;
      socket.to(room).emit('user_typing', { username, room, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      const { room, username } = data;
      socket.to(room).emit('user_typing', { username, room, isTyping: false });
    });

    // Message Read Receipts
    socket.on('mark_read', async (data) => {
      const { room, userId } = data;
      try {
        await dbRun(
          `UPDATE messages SET status = 'read' WHERE room = ? AND sender_id != ? AND status != 'read'`,
          [room, userId]
        );
        io.to(room).emit('messages_read_update', { room, readBy: userId });
      } catch (err) {
        console.error('Error updating read status:', err.message);
      }
    });

    // Disconnection handling
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const userData = activeSockets.get(socket.id);
      activeSockets.delete(socket.id);

      if (userData && userData.id) {
        const remaining = (userSocketCount.get(userData.id) || 1) - 1;
        if (remaining <= 0) {
          userSocketCount.delete(userData.id);
          try {
            await dbRun(`UPDATE users SET status = 'offline', last_seen = CURRENT_TIMESTAMP WHERE id = ?`, [userData.id]);
            const users = await dbAll(`SELECT id, username, avatar, status, last_seen FROM users`);
            io.emit('user_status_change', { userId: userData.id, status: 'offline', users });
          } catch (err) {
            console.error('Failed to update offline status:', err.message);
          }
        } else {
          userSocketCount.set(userData.id, remaining);
        }
      }
    });
  });
};
