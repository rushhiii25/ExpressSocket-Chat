const db = require('../config/db');

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Login or create user
exports.loginUser = async (req, res) => {
  try {
    const { username, password, avatar } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    let user = await dbGet(`SELECT * FROM users WHERE username = ?`, [trimmedUsername]);

    if (!user) {
      const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedUsername)}`;
      
      await dbRun(
        `INSERT INTO users (id, username, password, avatar, status, last_seen) VALUES (?, ?, ?, ?, 'online', CURRENT_TIMESTAMP)`,
        [userId, trimmedUsername, trimmedPassword, userAvatar]
      );

      user = {
        id: userId,
        username: trimmedUsername,
        avatar: userAvatar,
        status: 'online',
        last_seen: new Date().toISOString()
      };
    } else {
      // Validate password if user exists
      if (user.password && user.password !== trimmedPassword) {
        return res.status(401).json({ success: false, error: 'Incorrect password for this username' });
      }

      // If user had no password set previously, set it now
      if (!user.password) {
        await dbRun(`UPDATE users SET password = ? WHERE id = ?`, [trimmedPassword, user.id]);
      }

      // Update user status to online
      await dbRun(
        `UPDATE users SET status = 'online', last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
        [user.id]
      );
      user.status = 'online';
    }

    delete user.password; // Don't return password to client
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to process login' });
  }
};

// Get all registered users
exports.getUsers = async (req, res) => {
  try {
    const users = await dbAll(`SELECT id, username, avatar, status, last_seen FROM users ORDER BY username ASC`);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};
