require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add CORS package

const app = express();
app.use(bodyParser.json());

// Configure CORS
const allowedOrigins = ['https://visiongrid.online', 'http://localhost:5173']; // Add your frontend origin here
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Create a new pool using environment variables
// These can be passed via Docker (e.g., `-e POSTGRES_USER=...`) or a .env file
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the PostgreSQL database');
  }
});

// Initialize the database schema (async IIFE)
(async () => {
  try {
    // Create user table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      );
    `);

    // Create device table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device (
        id TEXT PRIMARY KEY,
        name TEXT
      );
    `);

    // Create user_device table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_device (
        user_id TEXT,
        device_id TEXT,
        PRIMARY KEY (user_id, device_id),
        FOREIGN KEY (user_id) REFERENCES "user"(id),
        FOREIGN KEY (device_id) REFERENCES device(id)
      );
    `);

    // Create user_temperature table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_temperature (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        device_id TEXT,
        value REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES "user"(id),
        FOREIGN KEY (device_id) REFERENCES device(id)
      );
    `);

    // Create device_temperature table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_temperature (
        id TEXT PRIMARY KEY,
        device_id TEXT,
        value REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES device(id)
      );
    `);

    console.log('Database tables initialized');
  } catch (dbErr) {
    console.error('Error initializing database:', dbErr.message);
  }
})();

//
// ENDPOINTS
//

// Endpoint 1: Register User
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Username and password are required' });
  }

  const id = username; // Using the username as the ID
  try {
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE username = $1',
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Username already exists' });
    }

    await pool.query(
      'INSERT INTO "user" (id, username, password) VALUES ($1, $2, $3)',
      [id, username, password]
    );
    return res.json({
      status: 'success',
      message: 'User registered successfully',
      userId: id,
    });
  } catch (err) {
    console.error('Insert error:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Failed to register user' });
  }
});

// Endpoint 2: Add Device
app.post('/add-device', async (req, res) => {
  const { userId, name } = req.body;
  if (!userId || !name) {
    return res
      .status(400)
      .json({ status: 'error', message: 'userId and name are required' });
  }

  // Create a device ID from the name
  const deviceId = name.toLowerCase().replace(/\s+/g, '-');

  try {
    // Insert device
    await pool.query('INSERT INTO device (id, name) VALUES ($1, $2)', [
      deviceId,
      name,
    ]);
    // Link user to device
    await pool.query(
      'INSERT INTO user_device (user_id, device_id) VALUES ($1, $2)',
      [userId, deviceId]
    );
    return res.json({
      status: 'success',
      message: 'Device added and linked successfully',
      deviceId,
    });
  } catch (err) {
    console.error('Error adding device:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Failed to add or link device' });
  }
});

// Endpoint 3: Set Temperature
app.put('/set-temperature', async (req, res) => {
  const { userId, deviceId, temperature } = req.body;
  if (!userId || !deviceId || temperature == null) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    // Check if the device is linked to the user
    const link = await pool.query(
      'SELECT * FROM user_device WHERE user_id = $1 AND device_id = $2',
      [userId, deviceId]
    );
    if (link.rows.length === 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Device not linked to this user' });
    }

    // Insert temperature
    const id = `${userId}-${deviceId}-${Date.now()}`;
    await pool.query(
      'INSERT INTO user_temperature (id, user_id, device_id, value) VALUES ($1, $2, $3, $4)',
      [id, userId, deviceId, temperature]
    );
    return res.json({
      status: 'success',
      message: 'Temperature set successfully',
    });
  } catch (err) {
    console.error('Error setting temperature:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Database error' });
  }
});

// Endpoint 4: Validate User
// Endpoint 4: Validate User
app.post('/validate-user', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Fetch user by username
    const userRes = await pool.query(
      'SELECT * FROM "user" WHERE username = $1',
      [username]
    );
    const user = userRes.rows[0];

    // Validate user credentials
    if (!user || user.password !== password) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Invalid username or password' });
    }

    // Fetch deviceId associated with the user from user_device table
    const deviceRes = await pool.query(
      'SELECT device_id FROM user_device WHERE user_id = $1',
      [user.id]
    );

    // Extract deviceId (assuming only one device is linked)
    const deviceId = deviceRes.rows.length > 0 ? deviceRes.rows[0].device_id : null;

    // Return success response with userId and deviceId
    return res.json({ 
      status: 'success', 
      userId: user.id, 
      deviceId 
    });
  } catch (err) {
    console.error('Error validating user:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Database error' });
  }
});

// Endpoint 5: Get User Temperatures (via Query Params)
app.get('/get-user-temperatures/:userId', async (req, res) => {
    const { userId } = req.params; // Extract userId and deviceId from route parameters
  
    if (!userId) {
      return res
        .status(400)
        .json({ status: 'error', message: 'User ID is required' });
    }
  try {
    const temps = await pool.query(
      'SELECT * FROM user_temperature WHERE user_id = $1',
      [userId]
    );
    if (temps.rows.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'No temperatures found for this user' });
    }
    return res.json({ status: 'success', temperatures: temps.rows });
  } catch (err) {
    console.error('Error getting user temperatures:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Database error' });
  }
});

// Endpoint 6: Get Temperature for User and Device (Using Route Parameters)
app.get('/get-temperature/:userId/:deviceId', async (req, res) => {
  const { userId, deviceId } = req.params; // Extract userId and deviceId from route parameters

  if (!userId || !deviceId) {
    return res
      .status(400)
      .json({ status: 'error', message: 'User ID and Device ID are required' });
  }

  try {
    // Get user-specific temperature
    const userTempRes = await pool.query(
      'SELECT * FROM user_temperature WHERE user_id = $1 AND device_id = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, deviceId]
    );
    const userTemp = userTempRes.rows[0];
    if (!userTemp) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Invalid user or device relationship' });
    }

    // Get device-specific temperature
    const deviceTempRes = await pool.query(
      'SELECT * FROM device_temperature WHERE device_id = $1 ORDER BY created_at DESC LIMIT 1',
      [deviceId]
    );
    const deviceTemp = deviceTempRes.rows[0];

    return res.json({
      status: 'success',
      currentTemperature: deviceTemp ? deviceTemp.value : null,
      userTemperature: userTemp.value,
    });
  } catch (err) {
    console.error('Error getting temperature:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Database error' });
  }
});

// Endpoint 7: Get All Users
app.get('/get-all-users', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM "user"');
    return res.json({ status: 'success', users: users.rows });
  } catch (err) {
    console.error('Error fetching all users:', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'Database error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
