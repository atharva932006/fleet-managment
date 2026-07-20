-- Database Schema for Atharva Enterprises Fleet Management

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('owner', 'driver')) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
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

-- Drivers Table
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

-- Earnings Table
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  vehicle_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  category TEXT CHECK(category IN ('fuel', 'toll', 'parking', 'maintenance', 'puncture', 'insurance', 'permit', 'other')) NOT NULL,
  amount REAL NOT NULL,
  receipt_path TEXT,
  description TEXT,
  status TEXT CHECK(status IN ('approved', 'pending', 'rejected')) DEFAULT 'approved',
  submitted_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Settlements Table
CREATE TABLE IF NOT EXISTS settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_earnings REAL NOT NULL,
  driver_share_amount REAL NOT NULL,
  owner_share_amount REAL NOT NULL,
  expense_deductions REAL DEFAULT 0,
  final_payout REAL NOT NULL,
  status TEXT CHECK(status IN ('paid', 'pending')) DEFAULT 'pending',
  payment_date DATE,
  payment_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('insurance', 'permit', 'puc', 'service', 'payment')) NOT NULL,
  related_id INTEGER,
  read_status INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
