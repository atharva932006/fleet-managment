const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { verifyToken, requireOwner } = require('./auth');

// Apply Owner auth middleware to all routes here
router.use(verifyToken);
router.use(requireOwner);

// Help function: Check and generate expiry notifications
async function checkExpiries() {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  const vehicles = await query.all('SELECT * FROM vehicles WHERE status = "active"');
  for (const v of vehicles) {
    const dates = [
      { name: 'Insurance Expiry', date: new Date(v.insurance_expiry), type: 'insurance', field: 'insurance_expiry' },
      { name: 'Permit Expiry', date: new Date(v.permit_expiry), type: 'permit', field: 'permit_expiry' },
      { name: 'PUC Expiry', date: new Date(v.puc_expiry), type: 'puc', field: 'puc_expiry' },
      { name: 'Service Due', date: new Date(v.service_due), type: 'service', field: 'service_due' },
    ];

    for (const d of dates) {
      const diffTime = d.date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger reminder if date is in past or within next 14 days
      if (diffDays <= 14) {
        let msg = '';
        if (diffDays < 0) {
          msg = `Vehicle ${v.vehicle_number} ${d.name} expired on ${v[d.field]} (${Math.abs(diffDays)} days overdue).`;
        } else if (diffDays === 0) {
          msg = `Vehicle ${v.vehicle_number} ${d.name} is expiring today!`;
        } else {
          msg = `Vehicle ${v.vehicle_number} ${d.name} is expiring on ${v[d.field]} (${diffDays} days remaining).`;
        }

        // Check if this notification already exists and is unread
        const existing = await query.get(
          'SELECT id FROM notifications WHERE type = ? AND related_id = ? AND read_status = 0 AND title = ?',
          [d.type, v.id, d.name]
        );

        if (!existing) {
          await query.run(
            'INSERT INTO notifications (title, message, type, related_id) VALUES (?, ?, ?, ?)',
            [d.name, msg, d.type, v.id]
          );
        }
      }
    }
  }

  // Payment reminders (e.g. check driver settlements pending for more than 7 days)
  const pendingSettlements = await query.all(
    `SELECT s.*, u.name FROM settlements s
     JOIN drivers d ON s.driver_id = d.id
     JOIN users u ON d.user_id = u.id
     WHERE s.status = 'pending'`
  );
  for (const s of pendingSettlements) {
    const createdDate = new Date(s.created_at);
    const diffTime = today - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      const title = 'Payment Reminder';
      const msg = `Settlement of ₹${s.paid_to_driver} for Driver ${s.name} (Date: ${s.date}) is pending for ${diffDays} days.`;
      
      const existing = await query.get(
        'SELECT id FROM notifications WHERE type = "payment" AND related_id = ? AND read_status = 0 AND message LIKE ?',
        [s.driver_id, `%${s.date}%`]
      );

      if (!existing) {
        await query.run(
          'INSERT INTO notifications (title, message, type, related_id) VALUES (?, ?, ?, ?)',
          [title, msg, 'payment', s.driver_id]
        );
      }
    }
  }
}

// GET: Owner dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Generate fresh notifications first
    await checkExpiries();

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Total active stats
    const activeVehiclesCount = await query.get('SELECT COUNT(*) as count FROM vehicles WHERE status = "active"');
    const activeDriversCount = await query.get('SELECT COUNT(*) as count FROM drivers');

    // Earnings
    const todayEarnings = await query.get('SELECT SUM(total_amount) as total FROM earnings WHERE date = ?', [today]);
    const monthEarnings = await query.get('SELECT SUM(total_amount) as total FROM earnings WHERE date >= ?', [firstDayOfMonth]);

    // Expenses
    const todayExpenses = await query.get('SELECT SUM(amount) as total FROM expenses WHERE date = ? AND status = "approved"', [today]);
    const monthExpenses = await query.get('SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND status = "approved"', [firstDayOfMonth]);

    const earningsToday = todayEarnings.total || 0;
    const earningsMonth = monthEarnings.total || 0;
    const expensesToday = todayExpenses.total || 0;
    const expensesMonth = monthExpenses.total || 0;
    const netProfitToday = earningsToday - expensesToday;
    const netProfitMonth = earningsMonth - expensesMonth;

    // Charts: Category-wise expenses (this month)
    const categoryExpenses = await query.all(
      `SELECT category, SUM(amount) as total FROM expenses
       WHERE date >= ? AND status = "approved"
       GROUP BY category`,
      [firstDayOfMonth]
    );

    // Charts: Daily earnings (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dailyEarnings = await query.all(
      `SELECT date, SUM(total_amount) as total, SUM(amount_ola) as ola, SUM(amount_uber) as uber, SUM(amount_rapido) as rapido, SUM(amount_private) as private
       FROM earnings
       WHERE date >= ?
       GROUP BY date ORDER BY date ASC`,
      [thirtyDaysAgo]
    );

    // Charts: Vehicle-wise Performance (this month)
    const vehiclePerformance = await query.all(
      `SELECT v.vehicle_number, v.model_name,
              COALESCE(SUM(e.total_amount), 0) as total_earnings,
              COALESCE((SELECT SUM(ex.amount) FROM expenses ex WHERE ex.vehicle_id = v.id AND ex.date >= ? AND ex.status = 'approved'), 0) as total_expenses
       FROM vehicles v
       LEFT JOIN earnings e ON v.id = e.vehicle_id AND e.date >= ?
       GROUP BY v.id`,
      [firstDayOfMonth, firstDayOfMonth]
    );

    // Charts: Driver-wise Performance (this month)
    const driverPerformance = await query.all(
      `SELECT u.name, COALESCE(SUM(e.total_amount), 0) as total_earnings
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN earnings e ON d.id = e.driver_id AND e.date >= ?
       GROUP BY d.id`,
      [firstDayOfMonth]
    );

    res.json({
      kpis: {
        earningsToday,
        earningsMonth,
        expensesToday,
        expensesMonth,
        netProfitToday,
        netProfitMonth,
        activeVehicles: activeVehiclesCount.count,
        activeDrivers: activeDriversCount.count
      },
      charts: {
        categoryExpenses,
        dailyEarnings,
        vehiclePerformance,
        driverPerformance
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error generating dashboard statistics.' });
  }
});

// --- VEHICLES CRUD ---
router.get('/vehicles', async (req, res) => {
  try {
    const list = await query.all('SELECT * FROM vehicles ORDER BY vehicle_number ASC');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/vehicles', async (req, res) => {
  const { vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement } = req.body;
  if (!vehicle_number || !model_name || !fuel_type || !insurance_expiry || !permit_expiry || !puc_expiry || !service_due || !tyre_replacement) {
    return res.status(400).json({ message: 'All vehicle fields are required.' });
  }
  try {
    const result = await query.run(
      `INSERT INTO vehicles (vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement]
    );
    res.status(201).json({ id: result.id, message: 'Vehicle added successfully.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Vehicle number already exists.' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement, status } = req.body;
  try {
    await query.run(
      `UPDATE vehicles SET vehicle_number = ?, model_name = ?, fuel_type = ?, insurance_expiry = ?, permit_expiry = ?, puc_expiry = ?, service_due = ?, tyre_replacement = ?, status = ?
       WHERE id = ?`,
      [vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement, status, id]
    );
    res.json({ message: 'Vehicle updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/vehicles/:id', async (req, res) => {
  try {
    await query.run('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DRIVERS CRUD ---
router.get('/drivers', async (req, res) => {
  try {
    const list = await query.all(
      `SELECT d.id as driver_id, d.license_number, d.joining_date, d.share_percentage, d.assigned_vehicle_id,
              u.id as user_id, u.name, u.mobile, v.vehicle_number, v.model_name
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
       ORDER BY u.name ASC`
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/drivers', async (req, res) => {
  const { name, mobile, password, license_number, joining_date, share_percentage, assigned_vehicle_id } = req.body;
  if (!name || !mobile || !password || !license_number || !joining_date || share_percentage === undefined) {
    return res.status(400).json({ message: 'All driver fields are required.' });
  }
  try {
    // 1. Create User
    const password_hash = await bcrypt.hash(password, 10);
    const userResult = await query.run(
      'INSERT INTO users (mobile, name, password_hash, role) VALUES (?, ?, ?, "driver")',
      [mobile, name, password_hash]
    );

    // 2. Create Driver row
    const driverResult = await query.run(
      `INSERT INTO drivers (user_id, license_number, joining_date, share_percentage, assigned_vehicle_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userResult.id, license_number, joining_date, share_percentage, assigned_vehicle_id || null]
    );

    res.status(201).json({ id: driverResult.id, message: 'Driver created successfully.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Mobile number or license number already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/drivers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, mobile, password, license_number, joining_date, share_percentage, assigned_vehicle_id, user_id } = req.body;
  try {
    // Update user name/mobile
    await query.run('UPDATE users SET name = ?, mobile = ? WHERE id = ?', [name, mobile, user_id]);

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      await query.run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, user_id]);
    }

    // Update driver info
    await query.run(
      `UPDATE drivers SET license_number = ?, joining_date = ?, share_percentage = ?, assigned_vehicle_id = ?
       WHERE id = ?`,
      [license_number, joining_date, share_percentage, assigned_vehicle_id || null, id]
    );

    res.json({ message: 'Driver details updated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/drivers/:id', async (req, res) => {
  try {
    const driver = await query.get('SELECT user_id FROM drivers WHERE id = ?', [req.params.id]);
    if (driver) {
      // Deleting user will cascade delete drivers row
      await query.run('DELETE FROM users WHERE id = ?', [driver.user_id]);
    }
    res.json({ message: 'Driver deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- EARNINGS ---
router.get('/earnings', async (req, res) => {
  try {
    const logs = await query.all(
      `SELECT e.*, v.vehicle_number, u.name as driver_name
       FROM earnings e
       JOIN vehicles v ON e.vehicle_id = v.id
       JOIN drivers d ON e.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       ORDER BY e.date DESC, e.id DESC`
    );
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/earnings', async (req, res) => {
  const { date, vehicle_id, driver_id, amount_ola, amount_uber, amount_rapido, amount_private, fuel_expenses, other_expenses } = req.body;
  if (!date || !vehicle_id || !driver_id) {
    return res.status(400).json({ message: 'Date, vehicle, and driver are required.' });
  }
  const ola = parseFloat(amount_ola) || 0;
  const uber = parseFloat(amount_uber) || 0;
  const rapido = parseFloat(amount_rapido) || 0;
  const priv = parseFloat(amount_private) || 0;
  const total = ola + uber + rapido + priv;

  const fuel = parseFloat(fuel_expenses) || 0;
  const other = parseFloat(other_expenses) || 0;

  try {
    // 1. Insert Earnings
    await query.run(
      `INSERT INTO earnings (date, vehicle_id, driver_id, amount_ola, amount_uber, amount_rapido, amount_private, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, vehicle_id, driver_id, ola, uber, rapido, priv, total]
    );

    // 2. Insert Fuel expense if present
    if (fuel > 0) {
      await query.run(
        `INSERT INTO expenses (date, vehicle_id, driver_id, category, amount, description, status, submitted_by)
         VALUES (?, ?, ?, 'fuel', ?, 'Fuel cost from daily earnings entry', 'approved', ?)`,
        [date, vehicle_id, driver_id, fuel, req.user.id]
      );
    }

    // 3. Insert Other expense if present
    if (other > 0) {
      await query.run(
        `INSERT INTO expenses (date, vehicle_id, driver_id, category, amount, description, status, submitted_by)
         VALUES (?, ?, ?, 'other', ?, 'Other overhead cost from daily earnings entry', 'approved', ?)`,
        [date, vehicle_id, driver_id, other, req.user.id]
      );
    }

    res.status(201).json({ message: 'Earnings and matching expenses logged successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/earnings/:id', async (req, res) => {
  try {
    await query.run('DELETE FROM earnings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Earnings log deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// --- SETTLEMENTS ---
router.get('/settlements/calculate', async (req, res) => {
  const { driver_id, date } = req.query;
  if (!driver_id || !date) {
    return res.status(400).json({ message: 'driver_id and date are required.' });
  }
  try {
    const driver = await query.get('SELECT share_percentage FROM drivers WHERE id = ?', [driver_id]);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    // 1. Calculate total earnings on this date
    const earningsSum = await query.get(
      'SELECT SUM(total_amount) as total FROM earnings WHERE driver_id = ? AND date = ?',
      [driver_id, date]
    );
    const totalEarnings = earningsSum.total || 0;

    // 2. Fuel expenses on this date
    const fuelExpensesSum = await query.get(
      'SELECT SUM(amount) as total FROM expenses WHERE driver_id = ? AND date = ? AND category = "fuel" AND status = "approved"',
      [driver_id, date]
    );
    const fuelExpenses = fuelExpensesSum.total || 0;

    // 3. Other expenses (toll, parking, puncture, maintenance, etc.) on this date
    const otherExpensesSum = await query.get(
      'SELECT SUM(amount) as total FROM expenses WHERE driver_id = ? AND date = ? AND category != "fuel" AND status = "approved"',
      [driver_id, date]
    );
    const otherExpenses = otherExpensesSum.total || 0;

    // 4. Splits calculation
    const amountAfterExpenses = totalEarnings - fuelExpenses - otherExpenses;
    const driverShare = (amountAfterExpenses * driver.share_percentage) / 100;
    const ownerShare = amountAfterExpenses - driverShare;

    res.json({
      totalEarnings,
      fuelExpenses,
      otherExpenses,
      amountAfterExpenses,
      driverPercentage: driver.share_percentage,
      driverShare,
      ownerShare,
      paidToDriver: driverShare, // default actual payout to driver share
      ownerNet: ownerShare // default owner net
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/settlements', async (req, res) => {
  const {
    date, driver_id, total_earnings, fuel_expenses, other_expenses,
    amount_after_expenses, driver_percentage, driver_share, owner_share,
    paid_to_driver, owner_net, paid_to, status
  } = req.body;

  if (!driver_id || !date || total_earnings === undefined || paid_to_driver === undefined) {
    return res.status(400).json({ message: 'Required daily settlement fields are missing.' });
  }

  try {
    const result = await query.run(
      `INSERT INTO settlements (date, driver_id, total_earnings, fuel_expenses, other_expenses, amount_after_expenses, driver_percentage, driver_share, owner_share, paid_to_driver, owner_net, paid_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date, driver_id, total_earnings, fuel_expenses || 0, other_expenses || 0,
        amount_after_expenses, driver_percentage, driver_share, owner_share,
        paid_to_driver, owner_net, paid_to || '', status || 'pending'
      ]
    );
    res.status(201).json({ id: result.id, message: 'Daily settlement recorded successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settlements/:id', async (req, res) => {
  const { id } = req.params;
  const { paid_to } = req.body;
  try {
    await query.run(
      `UPDATE settlements SET status = 'paid', paid_to = ? WHERE id = ?`,
      [paid_to || 'bank of india', id]
    );
    res.json({ message: 'Settlement marked as paid.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/settlements', async (req, res) => {
  try {
    const history = await query.all(
      `SELECT s.*, u.name as driver_name, u.mobile as driver_mobile
       FROM settlements s
       JOIN drivers d ON s.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       ORDER BY s.date DESC, s.id DESC`
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- REPORTS ---
router.get('/reports', async (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }
  try {
    const summary = await query.get(
      `SELECT
         COALESCE(SUM(total_amount), 0) as total_earnings,
         COALESCE(SUM(amount_ola), 0) as ola_earnings,
         COALESCE(SUM(amount_uber), 0) as uber_earnings,
         COALESCE(SUM(amount_rapido), 0) as rapido_earnings,
         COALESCE(SUM(amount_private), 0) as private_earnings
       FROM earnings WHERE date BETWEEN ? AND ?`,
      [start_date, end_date]
    );

    const expensesTotal = await query.get(
      'SELECT COALESCE(SUM(expense), 0) as total FROM earnings WHERE date BETWEEN ? AND ?',
      [start_date, end_date]
    );

    const vehicleWise = await query.all(
      `SELECT v.vehicle_number, v.model_name,
              COALESCE(SUM(e.total_amount), 0) as earnings,
              COALESCE(SUM(e.expense), 0) as expenses
       FROM vehicles v
       LEFT JOIN earnings e ON v.id = e.vehicle_id AND e.date BETWEEN ? AND ?
       GROUP BY v.id`,
      [start_date, end_date]
    );

    const driverWise = await query.all(
      `SELECT u.name, u.mobile, d.share_percentage,
              COALESCE(SUM(e.total_amount), 0) as total_earnings,
              COALESCE(SUM(e.expense), 0) as driver_paid_expenses
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN earnings e ON d.id = e.driver_id AND e.date BETWEEN ? AND ?
       GROUP BY d.id`,
      [start_date, end_date]
    );

    res.json({
      period: { start_date, end_date },
      totalEarnings: summary.total_earnings,
      platformBreakdown: {
        ola: summary.ola_earnings,
        uber: summary.uber_earnings,
        rapido: summary.rapido_earnings,
        private: summary.private_earnings
      },
      totalExpenses: expensesTotal.total,
      netProfit: summary.total_earnings - expensesTotal.total,
      vehicleWise,
      driverWise
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NOTIFICATIONS ---
router.get('/notifications', async (req, res) => {
  try {
    const list = await query.all('SELECT * FROM notifications ORDER BY read_status ASC, created_at DESC LIMIT 50');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await query.run('UPDATE notifications SET read_status = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
