const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'atharva_secret_key_12345';

// JWT Verification Middleware helper
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

// Owner restriction middleware helper
function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied. Owner role required.' });
  }
  next();
}

// POST: Login
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password are required.' });
  }

  try {
    const user = await query.get('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET: Current user details
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await query.get('SELECT id, name, mobile, role FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If driver, get additional driver info
    if (user.role === 'driver') {
      const driverInfo = await query.get(
        `SELECT d.id as driver_id, d.license_number, d.joining_date, d.share_percentage, d.assigned_vehicle_id, v.vehicle_number, v.model_name
         FROM drivers d
         LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
         WHERE d.user_id = ?`,
        [user.id]
      );
      return res.json({ ...user, driverDetails: driverInfo });
    }

    res.json(user);
  } catch (err) {
    console.error('Fetch user details error:', err);
    res.status(500).json({ message: 'Server error fetching user details.' });
  }
});

module.exports = {
  router,
  verifyToken,
  requireOwner
};
