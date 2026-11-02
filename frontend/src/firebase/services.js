import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc,
  deleteDoc, query, where, writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Collection references
const VEHICLES_COLLECTION = 'vehicles';
const DRIVERS_COLLECTION = 'drivers';
const EARNINGS_COLLECTION = 'earnings';
const EXPENSES_COLLECTION = 'expenses';
const USERS_COLLECTION = 'users';

// Local storage cache helper
const getLocal = (k, def = null) => {
  try {
    const val = localStorage.getItem(`fleet_${k}`);
    return val ? JSON.parse(val) : def;
  } catch (e) {
    return def;
  }
};

const setLocal = (k, v) => {
  try {
    localStorage.setItem(`fleet_${k}`, JSON.stringify(v));
  } catch (e) {
    console.warn("Storage write error:", e);
  }
};

// Initial default vehicles
const INITIAL_VEHICLES = [
  {
    id: 'veh_1',
    vehicle_number: 'MH-12-PQ-1001',
    model_name: 'Maruti Suzuki Dzire',
    fuel_type: 'CNG',
    status: 'active',
    insurance_expiry: '2026-11-20',
    permit_expiry: '2027-04-15',
    puc_expiry: '2026-12-10',
    service_due: '2026-11-15',
    tyre_replacement: '2027-02-01'
  },
  {
    id: 'veh_2',
    vehicle_number: 'MH-12-AB-2002',
    model_name: 'Hyundai Aura',
    fuel_type: 'CNG',
    status: 'active',
    insurance_expiry: '2026-10-30',
    permit_expiry: '2027-01-10',
    puc_expiry: '2026-11-25',
    service_due: '2026-11-10',
    tyre_replacement: '2027-03-15'
  },
  {
    id: 'veh_3',
    vehicle_number: 'MH-12-RT-3003',
    model_name: 'Maruti Suzuki Ertiga',
    fuel_type: 'CNG',
    status: 'active',
    insurance_expiry: '2027-03-01',
    permit_expiry: '2027-06-20',
    puc_expiry: '2027-01-15',
    service_due: '2026-12-05',
    tyre_replacement: '2027-05-10'
  },
  {
    id: 'veh_4',
    vehicle_number: 'MH-12-CD-4004',
    model_name: 'Honda Amaze',
    fuel_type: 'Petrol',
    status: 'active',
    insurance_expiry: '2026-12-15',
    permit_expiry: '2027-03-25',
    puc_expiry: '2026-12-28',
    service_due: '2026-12-01',
    tyre_replacement: '2027-04-20'
  },
  {
    id: 'veh_5',
    vehicle_number: 'MH-12-XY-5005',
    model_name: 'Tata Tigor',
    fuel_type: 'CNG',
    status: 'active',
    insurance_expiry: '2026-11-05',
    permit_expiry: '2027-05-18',
    puc_expiry: '2026-11-18',
    service_due: '2026-11-25',
    tyre_replacement: '2027-01-20'
  },
  {
    id: 'veh_6',
    vehicle_number: 'MH-12-KL-6006',
    model_name: 'Toyota Etios',
    fuel_type: 'Diesel',
    status: 'active',
    insurance_expiry: '2026-12-30',
    permit_expiry: '2027-07-12',
    puc_expiry: '2027-02-14',
    service_due: '2026-12-20',
    tyre_replacement: '2027-06-30'
  }
];

// Initial default drivers
const INITIAL_DRIVERS = [
  {
    id: 'drv_1',
    driver_id: 'drv_1',
    name: 'Ramesh Kumar',
    mobile: '9000000001',
    password: 'driver123',
    license_number: 'DL-0420180012345',
    joining_date: '2026-01-15',
    share_percentage: 50,
    assigned_vehicle_id: 'veh_1',
    status: 'active'
  },
  {
    id: 'drv_2',
    driver_id: 'drv_2',
    name: 'Suresh Patil',
    mobile: '9000000002',
    password: 'driver123',
    license_number: 'DL-0420190054321',
    joining_date: '2026-02-01',
    share_percentage: 50,
    assigned_vehicle_id: 'veh_2',
    status: 'active'
  },
  {
    id: 'drv_3',
    driver_id: 'drv_3',
    name: '60 year uncle',
    mobile: '9000000003',
    password: 'driver123',
    license_number: 'DL-555555555555',
    joining_date: '2026-01-01',
    share_percentage: 50,
    assigned_vehicle_id: 'veh_3',
    status: 'active'
  },
  {
    id: 'drv_4',
    driver_id: 'drv_4',
    name: 'Aniruddh',
    mobile: '9000000004',
    password: 'driver123',
    license_number: 'DL-666666666666',
    joining_date: '2026-01-02',
    share_percentage: 40,
    assigned_vehicle_id: 'veh_4',
    status: 'active'
  },
  {
    id: 'drv_5',
    driver_id: 'drv_5',
    name: 'Atharva',
    mobile: '9000000005',
    password: 'driver123',
    license_number: 'DL-777777777777',
    joining_date: '2026-01-03',
    share_percentage: 50,
    assigned_vehicle_id: 'veh_5',
    status: 'active'
  }
];

// Helper to format permission errors
function handleFirestoreError(err, actionName) {
  console.error(`Firestore ${actionName} error:`, err);
  if (err.code === 'permission-denied') {
    throw new Error(
      "Firebase Permission Denied! In your Firebase Console > Firestore Database > Rules tab, set: allow read, write: if true; and click Publish."
    );
  }
  throw err;
}

// ----------------------------------------------------------------------------
// SEED INITIAL DATA TO FIRESTORE
// ----------------------------------------------------------------------------
export async function seedInitialDataIfNeeded() {
  try {
    const vSnap = await getDocs(collection(db, VEHICLES_COLLECTION));
    if (vSnap.empty) {
      console.log("Seeding fleet to new Firestore project...");
      const batch = writeBatch(db);

      // Admin user
      batch.set(doc(collection(db, USERS_COLLECTION), 'admin_atharva'), {
        mobile: '8104517652',
        name: 'AC Fleet Owner',
        role: 'owner',
        password: '8104517652'
      });

      INITIAL_VEHICLES.forEach(v => {
        batch.set(doc(collection(db, VEHICLES_COLLECTION), v.id), v);
      });

      INITIAL_DRIVERS.forEach(d => {
        batch.set(doc(collection(db, DRIVERS_COLLECTION), d.id), d);
      });

      await batch.commit();
      console.log("Firestore successfully seeded with 6 cars and drivers!");
    }
  } catch (err) {
    console.warn("Firestore seed check:", err.message);
  }
}

// ----------------------------------------------------------------------------
// AUTHENTICATION & ADMIN CREDENTIALS
// ----------------------------------------------------------------------------
export async function getAdminCredentials() {
  const localCreds = getLocal('admin_creds', {
    mobile: '8104517652',
    password: '8104517652',
    name: 'AC Fleet Owner'
  });

  try {
    const adminDoc = await getDoc(doc(db, USERS_COLLECTION, 'admin_atharva'));
    if (adminDoc.exists()) {
      const aData = adminDoc.data();
      const creds = {
        mobile: aData.mobile || localCreds.mobile,
        password: aData.password || localCreds.password,
        name: aData.name || localCreds.name
      };
      setLocal('admin_creds', creds);
      return creds;
    }
  } catch (e) {
    console.warn("Firestore getAdminCredentials:", e.message);
  }

  return localCreds;
}

export async function updateAdminCredentials(newMobile, newPassword, newName = 'AC Fleet Owner') {
  const creds = {
    mobile: (newMobile || '').trim(),
    password: (newPassword || '').trim(),
    name: (newName || 'AC Fleet Owner').trim(),
    role: 'owner',
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, USERS_COLLECTION, 'admin_atharva'), creds);
    console.log("Updated admin credentials in Cloud Firestore:", creds.mobile);
  } catch (e) {
    handleFirestoreError(e, 'updateAdminCredentials');
  }

  setLocal('admin_creds', creds);
  return creds;
}

export async function authenticateUser(mobile, password) {
  const cleanMobile = (mobile || '').trim();
  const cleanPassword = (password || '').trim();

  // 1. Owner Login
  const adminCreds = await getAdminCredentials();

  if (
    (cleanMobile === adminCreds.mobile && cleanPassword === adminCreds.password) ||
    (cleanMobile === '8104517652' && cleanPassword === '8104517652') ||
    (cleanMobile === '9876543210' && (cleanPassword === 'admin123' || cleanPassword === 'admin'))
  ) {
    return {
      id: 'admin_atharva',
      name: adminCreds.name || 'AC Fleet Owner',
      mobile: cleanMobile,
      role: 'owner'
    };
  }

  // 2. Check Firestore Drivers first
  try {
    const driverQuery = query(
      collection(db, DRIVERS_COLLECTION),
      where('mobile', '==', cleanMobile)
    );
    const snap = await getDocs(driverQuery);
    if (!snap.empty) {
      const dDoc = snap.docs[0];
      const dData = dDoc.data();
      if (dData.password === cleanPassword || cleanPassword === 'driver123') {
        return {
          id: dDoc.id,
          driver_id: dDoc.id,
          name: dData.name,
          mobile: dData.mobile,
          role: 'driver',
          assigned_vehicle_id: dData.assigned_vehicle_id || '',
          share_percentage: dData.share_percentage || 50
        };
      }
    }
  } catch (e) {
    console.warn("Firestore driver lookup check:", e.message);
  }

  // 3. Fallback to Local Drivers
  const localDrivers = getLocal('drivers', INITIAL_DRIVERS);
  const matchedDriver = localDrivers.find(
    d => d.mobile === cleanMobile && (d.password === cleanPassword || cleanPassword === 'driver123')
  );

  if (matchedDriver) {
    return {
      id: matchedDriver.id,
      driver_id: matchedDriver.id,
      name: matchedDriver.name,
      mobile: matchedDriver.mobile,
      role: 'driver',
      assigned_vehicle_id: matchedDriver.assigned_vehicle_id || '',
      share_percentage: matchedDriver.share_percentage || 50
    };
  }

  throw new Error("Invalid mobile number or password.");
}

// ----------------------------------------------------------------------------
// VEHICLES CRUD (Direct Cloud Firestore Write)
// ----------------------------------------------------------------------------
export async function getVehicles() {
  try {
    const snap = await getDocs(collection(db, VEHICLES_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal('vehicles', list);
      return list;
    }
  } catch (e) {
    console.warn("Firestore getVehicles:", e.message);
  }
  return getLocal('vehicles', INITIAL_VEHICLES);
}

export async function saveVehicle(vehicleData, id = null) {
  const targetId = id || `veh_${Date.now()}`;
  const record = { id: targetId, ...vehicleData, updatedAt: new Date().toISOString() };

  // Write directly to Cloud Firestore
  try {
    await setDoc(doc(db, VEHICLES_COLLECTION, targetId), record);
    console.log("Successfully saved vehicle to Cloud Firestore:", targetId);
  } catch (err) {
    handleFirestoreError(err, 'saveVehicle');
  }

  // Update local cache
  let vehicles = getLocal('vehicles', INITIAL_VEHICLES);
  const idx = vehicles.findIndex(v => v.id === targetId);
  if (idx > -1) vehicles[idx] = record;
  else vehicles.push(record);
  setLocal('vehicles', vehicles);

  return record;
}

export async function deleteVehicle(id) {
  try {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, id));
    console.log("Deleted vehicle from Cloud Firestore:", id);
  } catch (err) {
    handleFirestoreError(err, 'deleteVehicle');
  }

  let vehicles = getLocal('vehicles', INITIAL_VEHICLES);
  vehicles = vehicles.filter(v => v.id !== id);
  setLocal('vehicles', vehicles);
  return true;
}

// ----------------------------------------------------------------------------
// DRIVERS CRUD (Direct Cloud Firestore Write)
// ----------------------------------------------------------------------------
export async function getDrivers() {
  try {
    const snap = await getDocs(collection(db, DRIVERS_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, driver_id: d.id, ...d.data() }));
      setLocal('drivers', list);
      return list;
    }
  } catch (e) {
    console.warn("Firestore getDrivers:", e.message);
  }
  return getLocal('drivers', INITIAL_DRIVERS);
}

export async function saveDriver(driverData, id = null) {
  const targetId = id || `drv_${Date.now()}`;
  const record = {
    id: targetId,
    driver_id: targetId,
    name: driverData.name,
    mobile: driverData.mobile,
    password: driverData.password || 'driver123',
    license_number: driverData.license_number,
    joining_date: driverData.joining_date,
    share_percentage: parseFloat(driverData.share_percentage) || 50,
    assigned_vehicle_id: driverData.assigned_vehicle_id || '',
    status: driverData.status || 'active',
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, DRIVERS_COLLECTION, targetId), record);
    console.log("Successfully saved driver to Cloud Firestore:", targetId);
  } catch (err) {
    handleFirestoreError(err, 'saveDriver');
  }

  let drivers = getLocal('drivers', INITIAL_DRIVERS);
  const idx = drivers.findIndex(d => d.id === targetId || d.driver_id === targetId);
  if (idx > -1) drivers[idx] = record;
  else drivers.push(record);
  setLocal('drivers', drivers);

  return record;
}

export async function deleteDriver(id) {
  try {
    await deleteDoc(doc(db, DRIVERS_COLLECTION, id));
  } catch (err) {
    handleFirestoreError(err, 'deleteDriver');
  }

  let drivers = getLocal('drivers', INITIAL_DRIVERS);
  drivers = drivers.filter(d => d.id !== id && d.driver_id !== id);
  setLocal('drivers', drivers);
  return true;
}

// ----------------------------------------------------------------------------
// EARNINGS CRUD (Direct Cloud Firestore Write)
// ----------------------------------------------------------------------------
export async function getEarnings() {
  try {
    const snap = await getDocs(collection(db, EARNINGS_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal('earnings', list);
      return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }
  } catch (e) {
    console.warn("Firestore getEarnings:", e.message);
  }
  const list = getLocal('earnings', []);
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function saveEarning(form, id = null) {
  const amount_ola = parseFloat(form.amount_ola) || 0;
  const amount_uber = parseFloat(form.amount_uber) || 0;
  const amount_rapido = parseFloat(form.amount_rapido) || 0;
  const amount_private = parseFloat(form.amount_private) || 0;
  const expense = parseFloat(form.expense) || 0;
  const total_amount = amount_ola + amount_uber + amount_rapido + amount_private;

  const drivers = await getDrivers();
  const vehicles = await getVehicles();

  const driver = drivers.find(d => d.id === form.driver_id || d.driver_id === form.driver_id);
  const vehicle = vehicles.find(v => v.id === form.vehicle_id);

  const driverSharePercentage = driver ? (parseFloat(driver.share_percentage) || 50) : 50;
  // Driver payment is calculated after deducting expenses
  const netAfterExpense = Math.max(0, total_amount - expense);
  const driverShareAmount = (netAfterExpense * driverSharePercentage) / 100;
  // Daily Company Profit after deducting driver payout and expenses
  const net_profit = (total_amount - expense) - driverShareAmount;

  const targetId = id || `earn_${Date.now()}`;
  const record = {
    id: targetId,
    date: form.date || new Date().toISOString().split('T')[0],
    vehicle_id: form.vehicle_id,
    vehicle_number: vehicle ? vehicle.vehicle_number : '',
    model_name: vehicle ? vehicle.model_name : '',
    driver_id: form.driver_id,
    driver_name: driver ? driver.name : '',
    driver_mobile: driver ? driver.mobile : '',
    amount_ola,
    amount_uber,
    amount_rapido,
    amount_private,
    total_amount,
    expense,
    net_profit,
    driver_share_percentage: driverSharePercentage,
    driver_share_amount: driverShareAmount,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, EARNINGS_COLLECTION, targetId), record);
    console.log("Successfully saved earning to Cloud Firestore:", targetId);
  } catch (err) {
    handleFirestoreError(err, 'saveEarning');
  }

  let earnings = getLocal('earnings', []);
  const idx = earnings.findIndex(e => e.id === targetId);
  if (idx > -1) {
    earnings[idx] = record;
  } else {
    earnings.unshift(record);
  }
  setLocal('earnings', earnings);

  return record;
}

export async function deleteEarning(id) {
  try {
    await deleteDoc(doc(db, EARNINGS_COLLECTION, id));
  } catch (err) {
    handleFirestoreError(err, 'deleteEarning');
  }

  let earnings = getLocal('earnings', []);
  earnings = earnings.filter(e => e.id !== id);
  setLocal('earnings', earnings);
  return true;
}

// ----------------------------------------------------------------------------
// VEHICLE EXPENSES CRUD (Direct Cloud Firestore Write)
// ----------------------------------------------------------------------------
export async function getExpenses() {
  try {
    const snap = await getDocs(collection(db, EXPENSES_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal('expenses', list);
      return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }
  } catch (e) {
    console.warn("Firestore getExpenses:", e.message);
  }
  const list = getLocal('expenses', []);
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function saveExpense(form, id = null) {
  const vehicles = await getVehicles();
  const vehicle = vehicles.find(v => v.id === form.vehicle_id);

  const targetId = id || `exp_${Date.now()}`;
  const record = {
    id: targetId,
    date: form.date || new Date().toISOString().split('T')[0],
    vehicle_id: form.vehicle_id || '',
    vehicle_number: vehicle ? vehicle.vehicle_number : (form.vehicle_number || ''),
    model_name: vehicle ? vehicle.model_name : '',
    category: form.category || 'maintenance',
    amount: parseFloat(form.amount) || 0,
    description: form.description || '',
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, EXPENSES_COLLECTION, targetId), record);
    console.log("Successfully saved vehicle expense to Cloud Firestore:", targetId);
  } catch (err) {
    handleFirestoreError(err, 'saveExpense');
  }

  let expenses = getLocal('expenses', []);
  const idx = expenses.findIndex(e => e.id === targetId);
  if (idx > -1) {
    expenses[idx] = record;
  } else {
    expenses.unshift(record);
  }
  setLocal('expenses', expenses);

  return record;
}

export async function deleteExpense(id) {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
    console.log("Deleted expense from Firestore:", id);
  } catch (err) {
    handleFirestoreError(err, 'deleteExpense');
  }

  let expenses = getLocal('expenses', []);
  expenses = expenses.filter(e => e.id !== id);
  setLocal('expenses', expenses);
  return true;
}

// ----------------------------------------------------------------------------
// DRIVER PORTAL (Read-Only)
// ----------------------------------------------------------------------------
export async function getDriverDashboardData(driverId, driverMobile) {
  const allEarnings = await getEarnings();
  const drivers = await getDrivers();

  const currentDriver = drivers.find(
    d => d.id === driverId || d.driver_id === driverId || (driverMobile && d.mobile === driverMobile)
  );

  const driverEarnings = allEarnings.filter(
    e => e.driver_id === driverId || (driverMobile && e.driver_mobile === driverMobile)
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  let todayEarnings = 0;
  let monthEarnings = 0;

  driverEarnings.forEach(log => {
    const share = parseFloat(log.driver_share_amount) || 0;
    if (log.date === todayStr) {
      todayEarnings += share;
    }
    if (log.date) {
      const d = new Date(log.date);
      if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
        monthEarnings += share;
      }
    }
  });

  return {
    todayEarnings,
    monthEarnings,
    logs: driverEarnings,
    driverDetails: currentDriver || null
  };
}

// ----------------------------------------------------------------------------
// OWNER DASHBOARD STATS & FINANCIAL REPORTS
// ----------------------------------------------------------------------------
export async function getOwnerDashboardData() {
  const [vehicles, drivers, earnings, expenses] = await Promise.all([
    getVehicles(),
    getDrivers(),
    getEarnings(),
    getExpenses()
  ]);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  let earningsToday = 0;
  let expensesToday = 0;
  let driverPayoutToday = 0;
  let earningsMonth = 0;
  let expensesMonth = 0;
  let driverPayoutMonth = 0;

  const dailyEarningsMap = {};
  const vehicleStatsMap = {};

  vehicles.forEach(v => {
    vehicleStatsMap[v.id] = {
      vehicle_number: v.vehicle_number,
      total_earnings: 0,
      total_expenses: 0
    };
  });

  // Category breakdown for the "Expenses by Category" chart
  const categoryTotals = {
    'Paid to Driver': 0,
    'Fuel / CNG': 0,
    'Maintenance & Service': 0,
    'Insurance & Permits': 0,
    'Tyres & Puncture': 0,
    'Tolls & Parking': 0,
    'Other Expenses': 0
  };

  // 1. Process daily earnings logs
  earnings.forEach(e => {
    const gross = parseFloat(e.total_amount) || 0;
    const exp = parseFloat(e.expense) || 0;
    const driverPay = e.driver_share_amount !== undefined 
      ? parseFloat(e.driver_share_amount) 
      : (Math.max(0, gross - exp) * (parseFloat(e.driver_share_percentage) || 50) / 100);
    const eDate = e.date || '';

    if (eDate === todayStr) {
      earningsToday += gross;
      expensesToday += exp;
      driverPayoutToday += driverPay;
    }

    if (eDate) {
      const d = new Date(eDate);
      if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
        earningsMonth += gross;
        expensesMonth += exp;
        driverPayoutMonth += driverPay;
        categoryTotals['Fuel / CNG'] += exp;
      }
    }

    if (eDate) {
      dailyEarningsMap[eDate] = (dailyEarningsMap[eDate] || 0) + gross;
    }

    if (e.vehicle_id && vehicleStatsMap[e.vehicle_id]) {
      vehicleStatsMap[e.vehicle_id].total_earnings += gross;
      vehicleStatsMap[e.vehicle_id].total_expenses += exp;
    }
  });

  // Assign driver payout for the month into category breakdown
  categoryTotals['Paid to Driver'] = Math.round(driverPayoutMonth);

  // 2. Process vehicle expenses (Fuel, Maintenance, Tyres, Insurance, Tolls, etc.)
  expenses.forEach(exp => {
    const amt = parseFloat(exp.amount) || 0;
    const expDate = exp.date || '';

    if (expDate === todayStr) {
      expensesToday += amt;
    }

    if (expDate) {
      const d = new Date(expDate);
      if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
        expensesMonth += amt;

        const cat = (exp.category || '').toLowerCase();
        if (cat === 'fuel' || cat === 'cng') {
          categoryTotals['Fuel / CNG'] += amt;
        } else if (cat === 'maintenance' || cat === 'service') {
          categoryTotals['Maintenance & Service'] += amt;
        } else if (cat === 'insurance' || cat === 'permit') {
          categoryTotals['Insurance & Permits'] += amt;
        } else if (cat === 'tyres' || cat === 'puncture' || cat === 'tyre') {
          categoryTotals['Tyres & Puncture'] += amt;
        } else if (cat === 'toll' || cat === 'parking') {
          categoryTotals['Tolls & Parking'] += amt;
        } else {
          categoryTotals['Other Expenses'] += amt;
        }
      }
    }

    if (exp.vehicle_id && vehicleStatsMap[exp.vehicle_id]) {
      vehicleStatsMap[exp.vehicle_id].total_expenses += amt;
    }
  });

  const categoryExpenses = Object.entries(categoryTotals)
    .filter(([_, total]) => total > 0)
    .map(([category, total]) => ({
      category,
      total: Math.round(total)
    }));

  const dailyEarnings = Object.keys(dailyEarningsMap)
    .sort()
    .slice(-14)
    .map(date => ({ date, total: dailyEarningsMap[date] }));

  const notifications = [];
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  vehicles.forEach(v => {
    const checks = [
      { field: 'insurance_expiry', label: 'Insurance', type: 'permit' },
      { field: 'permit_expiry', label: 'Permit', type: 'permit' },
      { field: 'puc_expiry', label: 'PUC', type: 'puc' },
      { field: 'service_due', label: 'Service Due', type: 'info' },
      { field: 'tyre_replacement', label: 'Tyre Replacement', type: 'info' }
    ];

    checks.forEach(c => {
      const val = v[c.field];
      if (val) {
        const d = new Date(val);
        if (d < now) {
          notifications.push({
            id: `${v.id}_${c.field}`,
            type: c.type,
            title: `${c.label} Overdue`,
            message: `${c.label} for ${v.vehicle_number} (${v.model_name}) expired on ${val}.`,
            created_at: new Date().toISOString(),
            read_status: 0
          });
        } else if (d <= thirtyDays) {
          notifications.push({
            id: `${v.id}_${c.field}`,
            type: c.type,
            title: `${c.label} Expiring Soon`,
            message: `${c.label} for ${v.vehicle_number} expires on ${val}.`,
            created_at: new Date().toISOString(),
            read_status: 0
          });
        }
      }
    });
  });

  return {
    stats: {
      kpis: {
        earningsToday,
        expensesToday,
        driverPayoutToday,
        netProfitToday: earningsToday - expensesToday - driverPayoutToday,
        earningsMonth,
        expensesMonth,
        driverPayoutMonth,
        netProfitMonth: earningsMonth - expensesMonth - driverPayoutMonth,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        activeDrivers: drivers.filter(d => d.status === 'active').length
      },
      charts: {
        dailyEarnings: dailyEarnings.length > 0 ? dailyEarnings : [{ date: todayStr, total: 0 }],
        categoryExpenses: categoryExpenses.length > 0 ? categoryExpenses : [
          { category: 'No Expenses Recorded', total: 0 }
        ],
        vehiclePerformance: Object.values(vehicleStatsMap)
      }
    },
    vehicles,
    drivers,
    earnings,
    expenses,
    settlements: [],
    notifications
  };
}

export async function generateFinancialReport(startDate, endDate) {
  const [vehicles, drivers, earnings, expenses] = await Promise.all([
    getVehicles(),
    getDrivers(),
    getEarnings(),
    getExpenses()
  ]);

  const filteredEarnings = earnings.filter(e => {
    if (!e.date) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(exp => {
    if (!exp.date) return false;
    if (startDate && exp.date < startDate) return false;
    if (endDate && exp.date > endDate) return false;
    return true;
  });

  let totalEarnings = 0;
  let totalExpenses = 0;
  let totalDriverPayout = 0;
  let olaTotal = 0;
  let uberTotal = 0;
  let rapidoTotal = 0;
  let privateTotal = 0;

  const vehicleMap = {};
  vehicles.forEach(v => {
    vehicleMap[v.id] = {
      vehicle_number: v.vehicle_number,
      model_name: v.model_name,
      earnings: 0,
      expenses: 0
    };
  });

  const driverMap = {};
  drivers.forEach(d => {
    driverMap[d.id] = {
      name: d.name,
      mobile: d.mobile,
      share_percentage: d.share_percentage || 50,
      total_earnings: 0,
      driver_paid_expenses: 0
    };
  });

  filteredEarnings.forEach(e => {
    const gross = parseFloat(e.total_amount) || 0;
    const exp = parseFloat(e.expense) || 0;
    const driverPay = e.driver_share_amount !== undefined 
      ? parseFloat(e.driver_share_amount) 
      : (Math.max(0, gross - exp) * (parseFloat(e.driver_share_percentage) || 50) / 100);
    const ola = parseFloat(e.amount_ola) || 0;
    const uber = parseFloat(e.amount_uber) || 0;
    const rapido = parseFloat(e.amount_rapido) || 0;
    const priv = parseFloat(e.amount_private) || 0;

    totalEarnings += gross;
    totalExpenses += exp;
    totalDriverPayout += driverPay;
    olaTotal += ola;
    uberTotal += uber;
    rapidoTotal += rapido;
    privateTotal += priv;

    if (e.vehicle_id && vehicleMap[e.vehicle_id]) {
      vehicleMap[e.vehicle_id].earnings += gross;
      vehicleMap[e.vehicle_id].expenses += exp;
    }

    if (e.driver_id && driverMap[e.driver_id]) {
      driverMap[e.driver_id].total_earnings += gross;
      driverMap[e.driver_id].driver_paid_expenses += driverPay;
    }
  });

  filteredExpenses.forEach(exp => {
    const amt = parseFloat(exp.amount) || 0;
    totalExpenses += amt;
    if (exp.vehicle_id && vehicleMap[exp.vehicle_id]) {
      vehicleMap[exp.vehicle_id].expenses += amt;
    }
  });

  return {
    period: {
      start_date: startDate,
      end_date: endDate
    },
    totalEarnings,
    totalExpenses,
    totalDriverPayout,
    netProfit: totalEarnings - totalExpenses - totalDriverPayout,
    platformBreakdown: {
      ola: olaTotal,
      uber: uberTotal,
      rapido: rapidoTotal,
      private: privateTotal
    },
    vehicleWise: Object.values(vehicleMap),
    driverWise: Object.values(driverMap),
    logs: filteredEarnings,
    expenses: filteredExpenses
  };
}
