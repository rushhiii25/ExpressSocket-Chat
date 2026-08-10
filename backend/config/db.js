const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../chat.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'offline',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for existing tables
  db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => {});

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room TEXT NOT NULL DEFAULT 'general',
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_avatar TEXT,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      status TEXT DEFAULT 'sent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  // Insert default channels if not exists
  const defaultRooms = [
    { id: 'general', name: 'General Chat', description: 'Public discussion for everyone' },
    { id: 'tech', name: 'Tech Talk', description: 'Discussion about technology and code' },
    { id: 'random', name: 'Random', description: 'Casual off-topic banter' }
  ];

  const stmt = db.prepare(`INSERT OR IGNORE INTO rooms (id, name, description) VALUES (?, ?, ?)`);
  defaultRooms.forEach(room => {
    stmt.run(room.id, room.name, room.description);
  });
  stmt.finalize();
});

module.exports = db;
