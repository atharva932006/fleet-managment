const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../fleet.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const query = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

async function initDb() {
  // Drop settlements & earnings to rebuild clean
  await query.exec('DROP TABLE IF EXISTS settlements;');
  await query.exec('DROP TABLE IF EXISTS earnings;');
  await query.exec('DROP TABLE IF EXISTS expenses;');

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('owner', 'driver')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_number TEXT UNIQUE NOT NULL,
      model_name TEXT NOT NULL,
      fuel_type TEXT CHECK(fuel_type IN ('CNG', 'Petrol', 'Diesel', 'EV')) NOT NULL,
      insurance_expiry DATE NOT NULL,
      permit_expiry DATE NOT NULL,
      puc_expiry DATE NOT NULL,
      service_due DATE NOT NULL,
      tyre_replacement DATE NOT NULL,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      license_number TEXT UNIQUE NOT NULL,
      joining_date DATE NOT NULL,
      share_percentage REAL NOT NULL,
      assigned_vehicle_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS earnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      vehicle_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      amount_ola REAL DEFAULT 0,
      amount_uber REAL DEFAULT 0,
      amount_rapido REAL DEFAULT 0,
      amount_private REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      expense REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      driver_id INTEGER NOT NULL,
      total_earnings REAL NOT NULL,
      expense REAL DEFAULT 0,
      amount_after_expenses REAL NOT NULL,
      driver_percentage REAL NOT NULL,
      driver_share REAL NOT NULL,
      owner_share REAL NOT NULL,
      paid_to_driver REAL DEFAULT 0,
      owner_net REAL NOT NULL,
      paid_to TEXT,
      status TEXT CHECK(status IN ('paid', 'pending')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('insurance', 'permit', 'puc', 'service', 'payment')) NOT NULL,
      related_id INTEGER,
      read_status INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await query.exec(schema);
  console.log('Tables initialized/rebuilt successfully.');

  // Seed Owner
  const ownerMobile = '9876543210';
  const existingOwner = await query.get('SELECT * FROM users WHERE mobile = ?', [ownerMobile]);
  let ownerUserId;
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const oResult = await query.run(
      'INSERT INTO users (mobile, name, password_hash, role) VALUES (?, ?, ?, ?)',
      [ownerMobile, 'Atharva Owner', passwordHash, 'owner']
    );
    ownerUserId = oResult.id;
    console.log('Seed: Owner account created.');
  } else {
    ownerUserId = existingOwner.id;
  }

  // Seed Vehicles
  const existingVehicles = await query.all('SELECT * FROM vehicles');
  let vehicleId1, vehicleId2;
  if (existingVehicles.length === 0) {
    const v1 = await query.run(
      `INSERT INTO vehicles (vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['MH-12-PQ-1234', 'Maruti Suzuki WagonR CNG', 'CNG', '2026-10-15', '2026-12-01', '2026-08-20', '2026-09-10', '2027-05-15', 'active']
    );
    vehicleId1 = v1.id;

    const v2 = await query.run(
      `INSERT INTO vehicles (vehicle_number, model_name, fuel_type, insurance_expiry, permit_expiry, puc_expiry, service_due, tyre_replacement, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['MH-12-XY-5678', 'Hyundai Aura Diesel', 'Diesel', '2026-06-15', '2026-07-28', '2026-07-20', '2026-08-05', '2027-02-10', 'active']
    );
    vehicleId2 = v2.id;
  } else {
    vehicleId1 = existingVehicles[0].id;
    vehicleId2 = existingVehicles[1] ? existingVehicles[1].id : existingVehicles[0].id;
  }

  // Seed Drivers
  const defaultDrivers = [
    { name: 'Ramesh Kumar', mobile: '9000000001', license: 'DL-123456789012', join: '2025-01-10', share: 40.0, vId: vehicleId1 },
    { name: 'Suresh Patel', mobile: '9000000002', license: 'DL-987654321098', join: '2025-03-15', share: 50.0, vId: vehicleId2 },
    { name: '60 year uncle', mobile: '9000000003', license: 'DL-555555555555', join: '2026-01-01', share: 50.0, vId: vehicleId1 },
    { name: 'aniruddh', mobile: '9000000004', license: 'DL-666666666666', join: '2026-01-02', share: 40.0, vId: vehicleId2 },
    { name: 'atharva', mobile: '9000000005', license: 'DL-777777777777', join: '2026-01-03', share: 0.0, vId: vehicleId1 }
  ];

  for (const dr of defaultDrivers) {
    const existing = await query.get('SELECT * FROM users WHERE mobile = ?', [dr.mobile]);
    if (!existing) {
      const pwdHash = await bcrypt.hash('driver123', 10);
      const uResult = await query.run(
        'INSERT INTO users (mobile, name, password_hash, role) VALUES (?, ?, ?, "driver")',
        [dr.mobile, dr.name, pwdHash]
      );
      await query.run(
        'INSERT INTO drivers (user_id, license_number, joining_date, share_percentage, assigned_vehicle_id) VALUES (?, ?, ?, ?, ?)',
        [uResult.id, dr.license, dr.join, dr.share, dr.vId]
      );
    }
  }

  // Fetch driver IDs to seed historical transactions
  const uncleRow = await query.get('SELECT id FROM drivers WHERE user_id = (SELECT id FROM users WHERE mobile = "9000000003")');
  const aniruddhRow = await query.get('SELECT id FROM drivers WHERE user_id = (SELECT id FROM users WHERE mobile = "9000000004")');
  const atharvaRow = await query.get('SELECT id FROM drivers WHERE user_id = (SELECT id FROM users WHERE mobile = "9000000005")');

  if (uncleRow && aniruddhRow && atharvaRow) {
    // Seed Earnings with daily expenses directly inside the table
    // 23/05/2026 (60 year uncle)
    await query.run(
      'INSERT INTO earnings (date, vehicle_id, driver_id, amount_ola, total_amount, expense) VALUES (?, ?, ?, ?, ?, ?)',
      ['2026-05-23', vehicleId1, uncleRow.id, 1893, 1893, 812]
    );

    // 24/05/2026 (aniruddh)
    await query.run(
      'INSERT INTO earnings (date, vehicle_id, driver_id, amount_uber, total_amount, expense) VALUES (?, ?, ?, ?, ?, ?)',
      ['2026-05-24', vehicleId2, aniruddhRow.id, 3380, 3380, 1114]
    );

    // 25/05/2026 (atharva)
    await query.run(
      'INSERT INTO earnings (date, vehicle_id, driver_id, amount_private, total_amount, expense) VALUES (?, ?, ?, ?, ?, ?)',
      ['2026-05-25', vehicleId1, atharvaRow.id, 554, 554, 155]
    );

    // Seed Settlements
    // Row 1: 23/05/2026
    await query.run(
      `INSERT INTO settlements (date, driver_id, total_earnings, expense, amount_after_expenses, driver_percentage, driver_share, owner_share, paid_to_driver, owner_net, paid_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')`,
      ['2026-05-23', uncleRow.id, 1893, 812, 1081, 50, 540.5, 540.5, 578, 503, 'bank of india']
    );

    // Row 2: 24/05/2026
    await query.run(
      `INSERT INTO settlements (date, driver_id, total_earnings, expense, amount_after_expenses, driver_percentage, driver_share, owner_share, paid_to_driver, owner_net, paid_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')`,
      ['2026-05-24', aniruddhRow.id, 3380, 1114, 2266, 40, 906.4, 1359.6, 980, 1286, 'bank of india']
    );

    // Row 3: 25/05/2026
    await query.run(
      `INSERT INTO settlements (date, driver_id, total_earnings, expense, amount_after_expenses, driver_percentage, driver_share, owner_share, paid_to_driver, owner_net, paid_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')`,
      ['2026-05-25', atharvaRow.id, 554, 155, 399, 0, 0, 399, 0, 399, 'bank of india']
    );
    console.log('Seed: Simplified daily earnings and settlements successfully seeded.');
  }
}

module.exports = {
  db,
  query,
  initDb
};
