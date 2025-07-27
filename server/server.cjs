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


// Create users table if it doesn't exist
db.serialize(() => {

  // Foreign Keys for CRUD History. If you are reading this and searching for an issue to fix, 
  // you can create another page which shows the record history.
  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Logs table lusung
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    department TEXT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create a default admin user (password: admin123)
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password) 
          VALUES ('admin', 'admin@example.com', ?)`, [defaultPassword]);

  // Records table
  db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    user_id INTEGER,                                -- This is the Foreign key. Using this we would be able to see the creator of the record
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

});

// Register endpoint
app.post('/api/register', async (req, res) => {
  console.log('Registration attempt:', { username: req.body.username, email: req.body.email });
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          console.log('Database error:', err.message);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
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

// Fetch all records (protected route)
app.get('/api/records', authenticateToken, (req, res) => {
  db.all('SELECT * FROM records', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.post('/api/records', authenticateToken, (req, res) => {
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  db.run(
    'INSERT INTO records (name, email, department, user_id) VALUES (?, ?, ?, ?)',
    [name, email, department, req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        `INSERT INTO logs (user_id, name, email, department, action) VALUES (?, ?, ?, ?, ?)`,
        [req.user.userId, name, email, department, 'ADD'],
        (logErr) => {
          if (logErr) console.error('Log insert error:', logErr.message);
        }
      );

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

app.put('/api/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  db.run(
    `UPDATE records SET name = ?, email = ?, department = ? WHERE id = ?`,
    [name, email, department, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Record not found' });

      db.run(
        `INSERT INTO logs (user_id, name, email, department, action) VALUES (?, ?, ?, ?, ?)`,
        [req.user.userId, name, email, department, 'EDIT'],
        (logErr) => {
          if (logErr) console.error('Log insert error:', logErr.message);
        }
      );

      res.json({ id, name, email, department });
    }
  );
});

app.delete('/api/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM records WHERE id = ? AND user_id = ?',
    [id, req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Record not found or not authorized' });
      }

      res.status(204).send();
    }
  );
});


// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

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
    }
  );
});



// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(user);
    }
  );
});

// Get all history logs 
// app.get('/api/logs', authenticateToken, (req, res) => {
//   db.all(`SELECT * FROM logs ORDER BY timestamp DESC`, [], (err, rows) => {
//     if (err) {
//       console.error('Error fetching logs:', err.message);
//       return res.status(500).json({ error: 'Failed to fetch logs' });
//     }

//     res.json(rows);
//   });
// });

// Get all history logs with user email
app.get('/api/logs', authenticateToken, (req, res) => {
  db.all(`
    SELECT logs.*, users.email 
    FROM logs 
    LEFT JOIN users ON logs.user_id = users.id
    ORDER BY logs.timestamp DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching logs:', err.message);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    res.json(rows);
  });
});

// Add record and log the ADD action.
app.post('/api/add-record', authenticateToken, (req, res) => {
  const { name, department } = req.body;
  const userId = req.user.userId;

  if (!name || !department) {
    return res.status(400).json({ error: 'Name and department are required' });
  }

  db.run(
    `INSERT INTO logs (user_id, name, department, action) VALUES (?, ?, ?, ?)`,
    [userId, name, department, 'ADD'],
    function (err) {
      if (err) {
        console.error('Log insert error:', err.message);
        return res.status(500).json({ error: 'Database error while logging' });
      }

      return res.status(201).json({
        message: 'Record added and log saved',
        logId: this.lastID,
      });
    }
  );
});


// Edit record and log the EDIT action (lusung)
app.put('/api/edit-record/:id', authenticateToken, (req, res) => {
  const { name, department } = req.body;
  const userId = req.user.userId;

  if (!name || !department) {
    return res.status(400).json({ error: 'Name and department are required' });
  }

  db.run(
    `INSERT INTO logs (user_id, name, department, action) VALUES (?, ?, ?, ?)`,
    [userId, name, department, 'EDIT'],
    function (err) {
      if (err) {
        console.error('Log insert error:', err.message);
        return res.status(500).json({ error: 'Database error while logging' });
      }

      res.status(200).json({
        message: 'Record edited and log saved',
        logId: this.lastID,
      });
    }
  );
});

// Delete record and log the DELETE action (lusung)
app.delete('/api/delete-record/:id', authenticateToken, (req, res) => {
  const { name, department } = req.body;
  const userId = req.user.userId;

  if (!name || !department) {
    return res.status(400).json({ error: 'Name and department are required' });
  }

  db.run(
    `INSERT INTO logs (user_id, name, department, action) VALUES (?, ?, ?, ?)`,
    [userId, name, department, 'DELETE'],
    function (err) {
      if (err) {
        console.error('Log insert error:', err.message);
        return res.status(500).json({ error: 'Database error while logging' });
      }

      res.status(200).json({
        message: 'Record deleted and log saved',
        logId: this.lastID,
      });
    }
  );
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Database initialized successfully`);
});
