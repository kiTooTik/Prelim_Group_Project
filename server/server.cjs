const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Initialize SQLite database
const db = new sqlite3.Database('./crudDB.db');

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Logs table
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,        -- admin/user who did the action
    employee_name TEXT NOT NULL,     -- employee affected
    employee_email TEXT NOT NULL,    -- employee email affected
    department TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Records table
  db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

  // Default admin user
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(
    `INSERT OR IGNORE INTO users (username, email, password) 
     VALUES ('admin', 'admin@example.com', ?)`,
    [defaultPassword]
  );

  // Indexes for logs
  db.run(`CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)`);
});

// Utility function to log actions
function logAction(userId, name, email, department, action) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO logs (user_id, employee_name, employee_email, department, action)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, email, department, action],
      function (err) {
        if (err) {
          console.error('Log insert error:', err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function  (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }


        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(user);
    }
  );
});

// Get all logs with admin info
app.get('/api/logs', authenticateToken, (req, res) => {
  const sql = `
    SELECT l.*, u.username AS admin_username, u.email AS admin_email
    FROM logs l
    JOIN users u ON u.id = l.user_id
    ORDER BY l.timestamp DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch logs' });
    res.json(rows);
  });
});

// CRUD for records with logs

// Get all records
app.get('/api/records', authenticateToken, (req, res) => {
  db.all('SELECT * FROM records', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create record + log
app.post('/api/records', authenticateToken, (req, res) => {
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  db.run(
    'INSERT INTO records (name, email, department, user_id) VALUES (?, ?, ?, ?)',
    [name, email, department, req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction(req.user.userId, name, email, department, 'ADD');
      res.status(201).json({
        id: this.lastID,
        name,
        email,
        department,
        user_id: req.user.userId
      });
    }
  );
});

// Update record + log
app.put('/api/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  db.run(
    `UPDATE records SET name = ?, email = ?, department = ? WHERE id = ?`,
    [name, email, department, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Record not found' });

      logAction(req.user.userId, name, email, department, 'EDIT');
      res.json({ id, name, email, department });
    }
  );
});

// Delete record + log
app.delete('/api/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Get record info first (for logs)
  db.get('SELECT name, email, department FROM records WHERE id = ?', [id], (err, record) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!record) return res.status(404).json({ error: 'Record not found' });

    db.run(
      'DELETE FROM records WHERE id = ?',
      [id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        logAction(req.user.userId, record.name, record.email, record.department, 'DELETE');
        res.status(204).send();
      }
    );
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Database initialized successfully`);
});
