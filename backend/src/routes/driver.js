const express = require('express');
const router = express.Router();

const { query } = require('../db');
const { verifyToken } = require('./auth');

// Apply JWT Verification to all driver routes
router.use(verifyToken);

// Restrict to driver role
router.use((req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Access denied. Driver role required.' });
  }
  next();
});



// GET: Driver dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get driver details
    const driver = await query.get('SELECT id, share_percentage, assigned_vehicle_id FROM drivers WHERE user_id = ?', [req.user.id]);
    if (!driver) {
      return res.status(404).json({ message: 'Driver details not found.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // 1. Earnings (Daily, Weekly, Monthly)
    const todayEarnings = await query.get(
      'SELECT SUM(total_amount) as total FROM earnings WHERE driver_id = ? AND date = ?',
      [driver.id, today]
    );
    const weeklyEarnings = await query.get(
      'SELECT SUM(total_amount) as total FROM earnings WHERE driver_id = ? AND date >= ?',
      [driver.id, sevenDaysAgo]
    );
    const monthlyEarnings = await query.get(
      'SELECT SUM(total_amount) as total FROM earnings WHERE driver_id = ? AND date >= ?',
      [driver.id, firstDayOfMonth]
    );

    // 2. Pending payouts from settlements table
    const pendingPayout = await query.get(
      'SELECT SUM(paid_to_driver) as total FROM settlements WHERE driver_id = ? AND status = "pending"',
      [driver.id]
    );

    // Calculate Driver's estimated share of current month's earnings (before formal settlement)
    const grossMonth = monthlyEarnings.total || 0;
    const estDriverShareMonth = (grossMonth * driver.share_percentage) / 100;

    res.json({
      todayEarnings: todayEarnings.total || 0,
      weeklyEarnings: weeklyEarnings.total || 0,
      monthlyEarnings: grossMonth,
      estimatedShareMonth: estDriverShareMonth,
      sharePercentage: driver.share_percentage,
      pendingPayout: pendingPayout.total || 0
    });
  } catch (err) {
    console.error('Driver stats error:', err);
    res.status(500).json({ message: 'Server error fetching driver statistics.' });
  }
});

// GET: Assigned vehicle details
router.get('/vehicle', async (req, res) => {
  try {
    const vehicle = await query.get(
      `SELECT v.* FROM vehicles v
       JOIN drivers d ON d.assigned_vehicle_id = v.id
       WHERE d.user_id = ?`,
      [req.user.id]
    );

    if (!vehicle) {
      return res.json(null); // No vehicle assigned
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET: Driver's settlement history
router.get('/payments', async (req, res) => {
  try {
    const list = await query.all(
      `SELECT s.*
       FROM settlements s
       JOIN drivers d ON s.driver_id = d.id
       WHERE d.user_id = ?
       ORDER BY s.id DESC`,
      [req.user.id]
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
