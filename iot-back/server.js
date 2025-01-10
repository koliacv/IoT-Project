const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./iot.db');
app.use(bodyParser.json());

// Database initialization
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS device (
        id TEXT PRIMARY KEY,
        name TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS user_device (
        user_id TEXT,
        device_id TEXT,
        PRIMARY KEY (user_id, device_id),
        FOREIGN KEY (user_id) REFERENCES user(id),
        FOREIGN KEY (device_id) REFERENCES device(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS user_temperature (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        device_id TEXT,
        value REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS device_temperature (
        id TEXT PRIMARY KEY,
        device_id TEXT,
        value REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Endpoint 1: Register User
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Перевірка чи передані дані коректні
    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required' });
    }

    const id = username;  // Використовуємо username як id

    db.get('SELECT * FROM user WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        if (user) {
            return res.status(400).json({ status: 'error', message: 'Username already exists' });
        }
        db.run(
            'INSERT INTO user (id, username, password) VALUES (?, ?, ?)',
            [id, username, password],
            (err) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ status: 'error', message: 'Failed to register user' });
                }
                res.json({ status: 'success', message: 'User registered successfully', userId: id });
            }
        );
    });
});

// Endpoint 2: Add Device
app.post('/add-device', (req, res) => {
    const { userId, name } = req.body;
    const deviceId = name.toLowerCase().replace(/\s+/g, '-');  // Create a device ID from the name

    db.run(
        'INSERT INTO device (id, name) VALUES (?, ?)',
        [deviceId, name],
        (err) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Failed to add device' });
            }
            db.run(
                'INSERT INTO user_device (user_id, device_id) VALUES (?, ?)',
                [userId, deviceId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ status: 'error', message: 'Failed to link device to user' });
                    }
                    res.json({ status: 'success', message: 'Device added and linked successfully', deviceId });
                }
            );
        }
    );
});

// Endpoint 3: Set Temperature
app.put('/set-temperature', (req, res) => {
    const { userId, deviceId, temperature } = req.body;

    db.get('SELECT * FROM user_device WHERE user_id = ? AND device_id = ?', [userId, deviceId], (err, link) => {
        if (err || !link) {
            return res.status(400).json({ status: 'error', message: 'Device not linked to this user' });
        }
        const id = `${userId}-${deviceId}-${Date.now()}`;
        db.run(
            'INSERT INTO user_temperature (id, user_id, device_id, value) VALUES (?, ?, ?, ?)',
            [id, userId, deviceId, temperature],
            (err) => {
                if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
                res.json({ status: 'success', message: 'Temperature set successfully' });
            }
        );
    });
});

// Endpoint 4: Validate User
app.post('/validate-user', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM user WHERE username = ?', [username], (err, user) => {
        if (err || !user || user.password !== password) {
            return res.status(404).json({ status: 'error', message: 'Invalid username or password' });
        }
        res.json({ status: 'success', userId: user.id });
    });
});

// Endpoint 5: Get User Temperatures (via Query Params)
app.get('/get-user-temperatures', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    db.all('SELECT * FROM user_temperature WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No temperatures found for this user' });
        }
        res.json({ status: 'success', temperatures: rows });
    });
});

// Endpoint 6: Get Temperature for User and Device (Using Query Params)
app.get('/get-temperature', (req, res) => {
    const { userId, deviceId } = req.query;

    if (!userId || !deviceId) {
        return res.status(400).json({ status: 'error', message: 'User ID and Device ID are required' });
    }

    db.get('SELECT * FROM user_temperature WHERE user_id = ? AND device_id = ?', [userId, deviceId], (err, temp) => {
        if (err || !temp) {
            return res.status(404).json({ status: 'error', message: 'Invalid user or device relationship' });
        }

        db.get(
            'SELECT * FROM device_temperature WHERE device_id = ? ORDER BY created_at DESC LIMIT 1',
            [deviceId],
            (err, deviceTemp) => {
                res.json({
                    status: 'success',
                    currentTemperature: deviceTemp ? deviceTemp.value : null,
                    userTemperature: temp.value
                });
            }
        );
    });
});

// Endpoint 7: Get All Users
app.get('/get-all-users', (req, res) => {
    db.all('SELECT * FROM user', (err, rows) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', users: rows });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
