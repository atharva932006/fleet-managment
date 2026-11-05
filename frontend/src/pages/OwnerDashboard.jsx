import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOwnerDashboardData,
  saveVehicle as dbSaveVehicle,
  deleteVehicle as dbDeleteVehicle,
  saveDriver as dbSaveDriver,
  deleteDriver as dbDeleteDriver,
  saveEarning as dbSaveEarning,
  deleteEarning as dbDeleteEarning,
  saveExpense as dbSaveExpense,
  deleteExpense as dbDeleteExpense,
  generateFinancialReport as dbGenerateReport,
  getAdminCredentials,
  updateAdminCredentials
} from '../firebase/services';
import {
  LayoutDashboard, Car, Users, IndianRupee, AlertTriangle, TrendingUp, Plus,
  Edit2, Trash2, LogOut, Sun, Moon, FileText, Check, X, Eye, Download, Bell, Info,
  Receipt, Wrench, Fuel, Key, Lock, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import acLogo from '../assets/logo.png';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

const OwnerDashboard = ({ toggleTheme, darkMode }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [vehicleModal, setVehicleModal] = useState({ show: false, mode: 'add', data: null });
  const [driverModal, setDriverModal] = useState({ show: false, mode: 'add', data: null });
  const [earningModal, setEarningModal] = useState({ show: false, mode: 'add', data: null });
  const [expenseModal, setExpenseModal] = useState({ show: false, mode: 'add', data: null });
  const [receiptViewer, setReceiptViewer] = useState({ show: false, path: '' });
  const [adminModal, setAdminModal] = useState(false);
  const [adminCredsForm, setAdminCredsForm] = useState({ mobile: '', password: '', confirmPassword: '', name: '' });

  // Filter state for Vehicle Expenses tab
  const [expenseVehicleFilter, setExpenseVehicleFilter] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');

  // Periodic Analytics State (Day, Week, Month, Custom Range)
  const [periodType, setPeriodType] = useState('day'); // 'day', 'week', 'month', 'custom'
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: '', model_name: '', fuel_type: 'CNG',
    insurance_expiry: '', fitness_expiry: '', tax_expiry: '', permit_expiry: '', puc_expiry: '',
    service_due: '', tyre_replacement: '', status: 'active'
  });
  const [driverForm, setDriverForm] = useState({
    name: '', mobile: '', password: '', license_number: '',
    joining_date: '', share_percentage: 50, assigned_vehicle_id: ''
  });
  const [earningForm, setEarningForm] = useState({
    date: new Date().toISOString().split('T')[0], vehicle_id: '', driver_id: '',
    amount_ola: '', amount_uber: '', amount_rapido: '', amount_private: '',
    expense: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0], vehicle_id: '', driver_id: '',
    category: 'fuel', amount: '', description: ''
  });

  // Reports state
  const [reportsFilter, setReportsFilter] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [reportsData, setReportsData] = useState(null);

  // Fetch all administrative data from Firebase Firestore
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOwnerDashboardData();
      setStats(data.stats);
      setVehicles(data.vehicles);
      setDrivers(data.drivers);
      setEarnings(data.earnings);
      setExpenses(data.expenses || []);
      setSettlements(data.settlements || []);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError('Error loading dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle reports generation
  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    try {
      const data = await dbGenerateReport(reportsFilter.start_date, reportsFilter.end_date);
      setReportsData(data);
    } catch (err) {
      console.error("Report generation error:", err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      handleGenerateReport();
    }
  }, [activeTab]);

  // --- CRUD FUNCTIONS (Firebase Firestore) ---

  // Vehicles
  const saveVehicle = async (e) => {
    e.preventDefault();
    try {
      const targetId = vehicleModal.mode === 'add' ? null : vehicleModal.data.id;
      await dbSaveVehicle(vehicleForm, targetId);
      setVehicleModal({ show: false, mode: 'add', data: null });
      setVehicleForm({
        vehicle_number: '', model_name: '', fuel_type: 'CNG',
        insurance_expiry: '', fitness_expiry: '', tax_expiry: '', permit_expiry: '', puc_expiry: '',
        service_due: '', tyre_replacement: '', status: 'active'
      });
      await fetchData();
      alert('Vehicle saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to remove this vehicle? All linked records will be affected.')) return;
    try {
      setVehicles(prev => prev.filter(v => v.id !== id));
      await dbDeleteVehicle(id);
      await fetchData();
    } catch (err) {
      alert(err.message);
      await fetchData();
    }
  };

  // Drivers
  const saveDriver = async (e) => {
    e.preventDefault();
    try {
      const targetId = driverModal.mode === 'add' ? null : (driverModal.data.driver_id || driverModal.data.id);
      await dbSaveDriver(driverForm, targetId);
      setDriverModal({ show: false, mode: 'add', data: null });
      setDriverForm({
        name: '', mobile: '', password: '', license_number: '',
        joining_date: '', share_percentage: 50, assigned_vehicle_id: ''
      });
      await fetchData();
      alert('Driver saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to remove this driver? Driver account access will be revoked.')) return;
    try {
      setDrivers(prev => prev.filter(d => d.id !== id && d.driver_id !== id));
      await dbDeleteDriver(id);
      await fetchData();
    } catch (err) {
      alert(err.message);
      await fetchData();
    }
  };

  // Earnings
  const saveEarning = async (e) => {
    e.preventDefault();
    try {
      const targetId = earningModal.mode === 'edit' && earningModal.data ? earningModal.data.id : null;
      await dbSaveEarning(earningForm, targetId);
      setEarningModal({ show: false, mode: 'add', data: null });
      setEarningForm({
        date: new Date().toISOString().split('T')[0], vehicle_id: '', driver_id: '',
        amount_ola: '', amount_uber: '', amount_rapido: '', amount_private: '',
        expense: ''
      });
      await fetchData();
      alert(targetId ? 'Daily vehicle earnings updated successfully!' : 'Daily vehicle earnings saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEarning = async (id) => {
    if (!confirm('Are you sure you want to delete this earning entry?')) return;
    try {
      await dbDeleteEarning(id);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Expenses
  const saveExpense = async (e) => {
    e.preventDefault();
    try {
      const targetId = expenseModal.mode === 'edit' && expenseModal.data ? expenseModal.data.id : null;
      await dbSaveExpense(expenseForm, targetId);
      setExpenseModal({ show: false, mode: 'add', data: null });
      setExpenseForm({
        date: new Date().toISOString().split('T')[0], vehicle_id: '',
        category: 'maintenance', amount: '', description: ''
      });
      await fetchData();
      alert(targetId ? 'Vehicle expense updated successfully!' : 'Vehicle expense saved successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle expense entry?')) return;
    try {
      await dbDeleteExpense(id);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark notification as read
  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: 1 } : n));
  };

  // --- EXPORT FUNCTIONALITY ---

  // Export reports to CSV
  const handleExportCSV = () => {
    if (!reportsData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Overall Stats
    csvContent += "AC FLEET - FLEET PERFORMANCE REPORT\n";
    csvContent += `Period: ,${reportsData.period.start_date} to ${reportsData.period.end_date}\n\n`;
    csvContent += `Total Earnings,Total Expenses,Net Profit\n`;
    csvContent += `₹${reportsData.totalEarnings},₹${reportsData.totalExpenses},₹${reportsData.netProfit}\n\n`;

    // Platform Split
    csvContent += "PLATFORM SPLIT\n";
    csvContent += "Ola,Uber,Rapido,Private Trips\n";
    csvContent += `₹${reportsData.platformBreakdown.ola},₹${reportsData.platformBreakdown.uber},₹${reportsData.platformBreakdown.rapido},₹${reportsData.platformBreakdown.private}\n\n`;

    // Vehicle Wise
    csvContent += "VEHICLE PERFORMANCE\n";
    csvContent += "Vehicle Number,Model Name,Total Earnings,Total Expenses,Net Contribution\n";
    reportsData.vehicleWise.forEach(v => {
      csvContent += `${v.vehicle_number},${v.model_name},₹${v.earnings},₹${v.expenses},₹${v.earnings - v.expenses}\n`;
    });
    csvContent += "\n";

    // Driver Wise
    csvContent += "DRIVER PERFORMANCE\n";
    csvContent += "Driver Name,Mobile,Share Percentage,Gross Earnings Generated,Driver Payout Reimbursements\n";
    reportsData.driverWise.forEach(d => {
      csvContent += `${d.name},${d.mobile},${d.share_percentage}%,₹${d.total_earnings},₹${d.driver_paid_expenses}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_report_${reportsFilter.start_date}_to_${reportsFilter.end_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print for PDF Export
  const handleExportPDF = () => {
    window.print();
  };

  // Form modal helpers
  const openAddVehicle = () => {
    setVehicleForm({
      vehicle_number: '', model_name: '', fuel_type: 'CNG',
      insurance_expiry: '', fitness_expiry: '', tax_expiry: '', permit_expiry: '', puc_expiry: '',
      service_due: '', tyre_replacement: '', status: 'active'
    });
    setVehicleModal({ show: true, mode: 'add', data: null });
  };

  const openEditVehicle = (v) => {
    setVehicleForm({
      vehicle_number: v.vehicle_number, model_name: v.model_name, fuel_type: v.fuel_type,
      insurance_expiry: v.insurance_expiry || '',
      fitness_expiry: v.fitness_expiry || '',
      tax_expiry: v.tax_expiry || '',
      permit_expiry: v.permit_expiry || '',
      puc_expiry: v.puc_expiry || '',
      service_due: v.service_due || '',
      tyre_replacement: v.tyre_replacement || '',
      status: v.status || 'active'
    });
    setVehicleModal({ show: true, mode: 'edit', data: v });
  };

  const openAddDriver = () => {
    setDriverForm({
      name: '', mobile: '', password: '', license_number: '',
      joining_date: '', share_percentage: 50, assigned_vehicle_id: ''
    });
    setDriverModal({ show: true, mode: 'add', data: null });
  };

  const openEditDriver = (d) => {
    setDriverForm({
      name: d.name, mobile: d.mobile, password: '', license_number: d.license_number,
      joining_date: d.joining_date, share_percentage: d.share_percentage !== undefined ? d.share_percentage : 50,
      assigned_vehicle_id: d.assigned_vehicle_id || '', user_id: d.user_id
    });
    setDriverModal({ show: true, mode: 'edit', data: d });
  };

  const openAddEarning = () => {
    setEarningForm({
      date: new Date().toISOString().split('T')[0],
      vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
      driver_id: drivers.length > 0 ? (drivers[0].driver_id || drivers[0].id) : '',
      amount_ola: '', amount_uber: '', amount_rapido: '', amount_private: '',
      expense: ''
    });
    setEarningModal({ show: true, mode: 'add', data: null });
  };

  const openEditEarning = (e) => {
    setEarningForm({
      date: e.date || new Date().toISOString().split('T')[0],
      vehicle_id: e.vehicle_id || '',
      driver_id: e.driver_id || '',
      amount_ola: e.amount_ola !== undefined ? e.amount_ola : '',
      amount_uber: e.amount_uber !== undefined ? e.amount_uber : '',
      amount_rapido: e.amount_rapido !== undefined ? e.amount_rapido : '',
      amount_private: e.amount_private !== undefined ? e.amount_private : '',
      expense: e.expense !== undefined ? e.expense : ''
    });
    setEarningModal({ show: true, mode: 'edit', data: e });
  };

  const openAddExpense = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
      category: 'maintenance',
      amount: '',
      description: ''
    });
    setExpenseModal({ show: true, mode: 'add', data: null });
  };

  const openEditExpense = (exp) => {
    setExpenseForm({
      date: exp.date || new Date().toISOString().split('T')[0],
      vehicle_id: exp.vehicle_id || '',
      category: exp.category || 'maintenance',
      amount: exp.amount !== undefined ? exp.amount : '',
      description: exp.description || ''
    });
    setExpenseModal({ show: true, mode: 'edit', data: exp });
  };

  const openAdminModal = async () => {
    const creds = await getAdminCredentials();
    setAdminCredsForm({
      mobile: creds.mobile || '8104517652',
      password: creds.password || '8104517652',
      confirmPassword: creds.password || '8104517652',
      name: creds.name || 'AC Fleet Owner'
    });
    setAdminModal(true);
  };

  const handleUpdateAdminCreds = async (e) => {
    e.preventDefault();
    if (adminCredsForm.password !== adminCredsForm.confirmPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }
    if ((adminCredsForm.mobile || '').trim().length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if ((adminCredsForm.password || '').trim().length < 4) {
      alert("Password should be at least 4 characters long.");
      return;
    }

    try {
      await updateAdminCredentials(
        adminCredsForm.mobile,
        adminCredsForm.password,
        adminCredsForm.name
      );
      setAdminModal(false);
      alert(`Admin login details updated successfully!\n\nMobile: ${adminCredsForm.mobile}\nPassword: ${adminCredsForm.password}`);
    } catch (err) {
      alert("Failed updating credentials: " + err.message);
    }
  };

  // --- CHART RENDERING HELPERS ---
  const renderDashboardCharts = () => {
    if (!stats || !stats.charts) return null;

    const { dailyEarnings, categoryExpenses, vehiclePerformance } = stats.charts;

    // Line Chart: Daily Earnings
    const lineData = {
      labels: dailyEarnings.map(d => d.date.split('-').slice(1).join('/')),
      datasets: [
        {
          label: 'Total Earnings',
          data: dailyEarnings.map(d => d.total),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3,
        }
      ]
    };

    // Category Color Palette
    const categoryColorsMap = {
      'Paid to Driver': '#f59e0b',
      'Fuel / CNG': '#ef4444',
      'Maintenance & Service': '#3b82f6',
      'Insurance & Permits': '#8b5cf6',
      'Tyres & Puncture': '#06b6d4',
      'Tolls & Parking': '#10b981',
      'Other Expenses': '#64748b'
    };

    const validCategoryExpenses = (categoryExpenses || []).filter(c => (parseFloat(c.total) || 0) > 0);

    // Doughnut Chart: Expenses by Category
    const doughnutData = {
      labels: validCategoryExpenses.map(c => c.category),
      datasets: [
        {
          data: validCategoryExpenses.map(c => c.total),
          backgroundColor: validCategoryExpenses.map(c => categoryColorsMap[c.category] || '#6366f1'),
          borderWidth: 0,
        }
      ]
    };

    // Bar Chart: Vehicle Profitability
    const barData = {
      labels: vehiclePerformance.map(v => v.vehicle_number.split('-').slice(2).join('-')),
      datasets: [
        {
          label: 'Earnings',
          data: vehiclePerformance.map(v => v.total_earnings),
          backgroundColor: 'rgba(79, 70, 229, 0.85)',
          borderRadius: 4,
        },
        {
          label: 'Expenses',
          data: vehiclePerformance.map(v => v.total_expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          borderRadius: 4,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: darkMode ? '#9ca3af' : '#475569', font: { family: 'Inter' } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: darkMode ? '#9ca3af' : '#475569' } },
        y: { grid: { color: darkMode ? '#1f2937' : '#e2e8f0' }, ticks: { color: darkMode ? '#9ca3af' : '#475569' } }
      }
    };

    return (
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Daily Earnings Trend (30 Days)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ola/Uber/Rapido/Private</span>
          </div>
          <div className="chart-container">
            {dailyEarnings.length > 0 ? (
              <Line data={lineData} options={chartOptions} />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>No earnings data found.</p>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Expenses by Category (This Month)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Includes Driver Payouts & Vehicle Expenses</span>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {validCategoryExpenses.length > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>No expenses recorded this month.</p>
            )}
          </div>
          {validCategoryExpenses.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
              fontSize: '11px'
            }}>
              {validCategoryExpenses.map(c => (
                <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: categoryColorsMap[c.category] || '#6366f1'
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.category}:</span>
                  <b>₹{c.total.toLocaleString('en-IN')}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <h3 className="chart-title">Fleet Efficiency (Vehicle Wise Earnings vs Expenses)</h3>
          </div>
          <div className="chart-container">
            {vehiclePerformance.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>No vehicles registered yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper count for notifications badge
  const unreadCount = notifications.filter(n => n.read_status === 0).length;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 12px' }}>
          <img
            src={acLogo}
            alt="AC Fleet"
            style={{ maxWidth: '170px', width: '100%', height: 'auto', marginBottom: '6px' }}
          />
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Fleet Admin Portal
          </span>
        </div>
        
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} />
              Dashboard
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'periodic' ? 'active' : ''}`} onClick={() => setActiveTab('periodic')}>
              <CalendarDays size={18} />
              Day / Week / Month
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>
              <Car size={18} />
              Fleet Management
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
              <Users size={18} />
              Driver Register
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
              <IndianRupee size={18} />
              Daily Earnings Log
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
              <Receipt size={18} />
              Vehicle Expenses
            </a>
          </li>

          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <FileText size={18} />
              Business Reports
            </a>
          </li>
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} />
                <span>Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', right: -25, backgroundColor: 'var(--danger)', color: '#fff',
                    borderRadius: '50%', padding: '2px 6px', fontSize: '9px', fontWeight: 'bold'
                  }}>{unreadCount}</span>
                )}
              </div>
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
            <span>Logged as <b>Owner</b></span>
          </div>
          <button className="btn btn-secondary btn-block" onClick={openAdminModal}>
            <Key size={16} /> Admin Login Details
          </button>
          <button className="btn btn-secondary btn-block" onClick={toggleTheme}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button className="btn btn-danger btn-block" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="nav-title">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'periodic' && 'Day / Week / Month Analytics'}
              {activeTab === 'vehicles' && 'Manage Vehicles'}
              {activeTab === 'drivers' && 'Manage Drivers'}
              {activeTab === 'earnings' && 'Earnings Registry'}
              {activeTab === 'expenses' && 'Vehicle Expenses Management'}
              {activeTab === 'reports' && 'Financial Reports & Analytics'}
              {activeTab === 'alerts' && 'System alerts & Expiries'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>AC Fleet - Fleet • Rental • Mobility</p>
          </div>
          
          <div className="nav-actions">
            {activeTab === 'dashboard' && (
              <span style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '20px' }}>
                Today: <b>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
              </span>
            )}
            {activeTab === 'periodic' && (
              <span style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', padding: '6px 14px', borderRadius: '20px' }}>
                View: <b style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{periodType}</b>
              </span>
            )}
            {activeTab === 'vehicles' && (
              <button className="btn btn-primary" onClick={openAddVehicle}>
                <Plus size={16} /> Add Vehicle
              </button>
            )}
            {activeTab === 'drivers' && (
              <button className="btn btn-primary" onClick={openAddDriver}>
                <Plus size={16} /> Add Driver
              </button>
            )}
            {activeTab === 'earnings' && (
              <button className="btn btn-primary" onClick={openAddEarning}>
                <Plus size={16} /> Log Daily Earnings
              </button>
            )}
            {activeTab === 'expenses' && (
              <button className="btn btn-primary" onClick={openAddExpense}>
                <Plus size={16} /> Log Vehicle Expense
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '16px', color: 'var(--danger)' }}>
            <AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        {/* LOADING SHIMMER */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* TAB CONTENTS */}
        {!loading && (
          <>
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && stats && (
              <>
                {/* KPI Row */}
                <section className="kpi-grid">
                  <div className="card kpi-card">
                    <span className="kpi-label">Today's Gross Earnings</span>
                    <span className="kpi-value earnings">₹{stats.kpis.earningsToday.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="kpi-label">Today Paid to Drivers</span>
                    <span className="kpi-value" style={{ color: '#f59e0b' }}>
                      ₹{(stats.kpis.driverPayoutToday || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Today's Expenses</span>
                    <span className="kpi-value expenses">₹{stats.kpis.expensesToday.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Today's Net Profit</span>
                    <span className={`kpi-value profit ${stats.kpis.netProfitToday < 0 ? 'expenses' : ''}`}>
                      ₹{stats.kpis.netProfitToday.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Gross Earnings</span>
                    <span className="kpi-value earnings">₹{stats.kpis.earningsMonth.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="kpi-label">Total Paid to Drivers (Month)</span>
                    <span className="kpi-value" style={{ color: '#f59e0b' }}>
                      ₹{(stats.kpis.driverPayoutMonth || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Expenses</span>
                    <span className="kpi-value expenses">₹{stats.kpis.expensesMonth.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Net Profit</span>
                    <span className={`kpi-value profit ${stats.kpis.netProfitMonth < 0 ? 'expenses' : ''}`}>
                      ₹{stats.kpis.netProfitMonth.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Active Fleet</span>
                    <span className="kpi-value" style={{ color: 'var(--text-primary)' }}>{stats.kpis.activeVehicles}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Active Drivers</span>
                    <span className="kpi-value" style={{ color: 'var(--text-primary)' }}>{stats.kpis.activeDrivers}</span>
                  </div>
                </section>

                {/* Dashboard Charts */}
                {renderDashboardCharts()}
              </>
            )}

            {/* 1.5. PERIODIC ANALYTICS (DAY, WEEK, MONTH, CUSTOM) */}
            {activeTab === 'periodic' && (() => {
              // Helper to compute range
              const getActiveRange = () => {
                if (periodType === 'day') {
                  const dObj = new Date(selectedDay + 'T00:00:00');
                  const label = isNaN(dObj.getTime())
                    ? selectedDay
                    : dObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  return { start: selectedDay, end: selectedDay, label };
                }
                if (periodType === 'week') {
                  const now = new Date();
                  now.setDate(now.getDate() + (weekOffset * 7));
                  const day = now.getDay();
                  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
                  const monday = new Date(now.setDate(diffToMon));
                  const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));
                  const start = monday.toISOString().split('T')[0];
                  const end = sunday.toISOString().split('T')[0];
                  const label = `${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                  return { start, end, label };
                }
                if (periodType === 'month') {
                  const now = new Date();
                  now.setMonth(now.getMonth() + monthOffset);
                  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                  const label = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                  return { start, end, label };
                }
                return {
                  start: customRange.start,
                  end: customRange.end,
                  label: `${customRange.start} to ${customRange.end}`
                };
              };

              const activeRange = getActiveRange();

              // Filter earnings for this range
              const filteredEarnings = earnings.filter(e => {
                if (!e.date) return false;
                return e.date >= activeRange.start && e.date <= activeRange.end;
              });

              // Filter vehicle expenses for this range
              const filteredExpenses = expenses.filter(x => {
                if (!x.date) return false;
                return x.date >= activeRange.start && x.date <= activeRange.end;
              });

              let totalGross = 0;
              let totalDriverPayout = 0;
              let totalDailyRunExp = 0;
              let olaTotal = 0;
              let uberTotal = 0;
              let rapidoTotal = 0;
              let privateTotal = 0;

              const vehicleMap = {};
              vehicles.forEach(v => {
                vehicleMap[v.id] = {
                  id: v.id,
                  number: v.vehicle_number,
                  model: v.model_name,
                  logsCount: 0,
                  gross: 0,
                  driverPay: 0,
                  expenses: 0,
                  netProfit: 0
                };
              });

              const driverMap = {};
              drivers.forEach(d => {
                const key = d.id || d.driver_id;
                driverMap[key] = {
                  id: key,
                  name: d.name,
                  mobile: d.mobile,
                  sharePct: d.share_percentage !== undefined ? parseFloat(d.share_percentage) : 50,
                  logsCount: 0,
                  gross: 0,
                  payout: 0,
                  companyShare: 0
                };
              });

              filteredEarnings.forEach(e => {
                const gross = parseFloat(e.total_amount) || 0;
                const exp = parseFloat(e.expense) || 0;
                const netAfterExp = Math.max(0, gross - exp);
                const driverPay = e.driver_share_amount !== undefined
                  ? parseFloat(e.driver_share_amount)
                  : (netAfterExp * (e.driver_share_percentage !== undefined && e.driver_share_percentage !== '' ? parseFloat(e.driver_share_percentage) : 50) / 100);
                const netProfit = (gross - exp) - driverPay;

                totalGross += gross;
                totalDriverPayout += driverPay;
                totalDailyRunExp += exp;

                olaTotal += parseFloat(e.amount_ola) || 0;
                uberTotal += parseFloat(e.amount_uber) || 0;
                rapidoTotal += parseFloat(e.amount_rapido) || 0;
                privateTotal += parseFloat(e.amount_private) || 0;

                if (e.vehicle_id && vehicleMap[e.vehicle_id]) {
                  vehicleMap[e.vehicle_id].logsCount += 1;
                  vehicleMap[e.vehicle_id].gross += gross;
                  vehicleMap[e.vehicle_id].driverPay += driverPay;
                  vehicleMap[e.vehicle_id].expenses += exp;
                  vehicleMap[e.vehicle_id].netProfit += netProfit;
                }

                const dKey = e.driver_id;
                if (dKey && driverMap[dKey]) {
                  driverMap[dKey].logsCount += 1;
                  driverMap[dKey].gross += gross;
                  driverMap[dKey].payout += driverPay;
                  driverMap[dKey].companyShare += netProfit;
                }
              });

              let totalVehicleModuleExp = 0;
              filteredExpenses.forEach(exp => {
                const amt = parseFloat(exp.amount) || 0;
                totalVehicleModuleExp += amt;
                if (exp.vehicle_id && vehicleMap[exp.vehicle_id]) {
                  vehicleMap[exp.vehicle_id].expenses += amt;
                  vehicleMap[exp.vehicle_id].netProfit -= amt;
                }
              });

              const totalExpensesAll = totalDailyRunExp + totalVehicleModuleExp;
              const netCompanyProfit = totalGross - totalExpensesAll - totalDriverPayout;

              const shiftDay = (days) => {
                const d = new Date(selectedDay + 'T00:00:00');
                d.setDate(d.getDate() + days);
                setSelectedDay(d.toISOString().split('T')[0]);
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Time Range Filter Bar */}
                  <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '12px' }}>
                        <button
                          type="button"
                          className={`btn ${periodType === 'day' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                          onClick={() => setPeriodType('day')}
                        >
                          📅 Day View
                        </button>
                        <button
                          type="button"
                          className={`btn ${periodType === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                          onClick={() => setPeriodType('week')}
                        >
                          📆 Week View
                        </button>
                        <button
                          type="button"
                          className={`btn ${periodType === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                          onClick={() => setPeriodType('month')}
                        >
                          🗓️ Month View
                        </button>
                        <button
                          type="button"
                          className={`btn ${periodType === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
                          onClick={() => setPeriodType('custom')}
                        >
                          🔍 Custom Range
                        </button>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Viewing: <span style={{ color: 'var(--primary)' }}>{activeRange.label}</span>
                      </div>
                    </div>

                    {/* Mode Navigation Controls */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                      {periodType === 'day' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => shiftDay(-1)}>
                            <ChevronLeft size={16} /> Prev Day
                          </button>
                          <input
                            type="date"
                            className="form-input"
                            style={{ width: 'auto' }}
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                          />
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => shiftDay(1)}>
                            Next Day <ChevronRight size={16} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 14px' }}
                            onClick={() => setSelectedDay(new Date().toISOString().split('T')[0])}
                          >
                            Today
                          </button>
                        </div>
                      )}

                      {periodType === 'week' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setWeekOffset(w => w - 1)}>
                            <ChevronLeft size={16} /> Prev Week
                          </button>
                          <button
                            className={`btn ${weekOffset === 0 ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 14px' }}
                            onClick={() => setWeekOffset(0)}
                          >
                            This Week
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setWeekOffset(w => w + 1)}>
                            Next Week <ChevronRight size={16} />
                          </button>
                        </div>
                      )}

                      {periodType === 'month' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setMonthOffset(m => m - 1)}>
                            <ChevronLeft size={16} /> Prev Month
                          </button>
                          <button
                            className={`btn ${monthOffset === 0 ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 14px' }}
                            onClick={() => setMonthOffset(0)}
                          >
                            This Month
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setMonthOffset(m => m + 1)}>
                            Next Month <ChevronRight size={16} />
                          </button>
                        </div>
                      )}

                      {periodType === 'custom' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>From:</span>
                            <input
                              type="date"
                              className="form-input"
                              style={{ width: 'auto' }}
                              value={customRange.start}
                              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>To:</span>
                            <input
                              type="date"
                              className="form-input"
                              style={{ width: 'auto' }}
                              value={customRange.end}
                              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial KPI Summary Cards */}
                  <section className="kpi-grid">
                    <div className="card kpi-card">
                      <span className="kpi-label">Gross Revenue</span>
                      <span className="kpi-value earnings">₹{Math.round(totalGross).toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {filteredEarnings.length} vehicle trips/runs
                      </span>
                    </div>

                    <div className="card kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                      <span className="kpi-label">Total Paid to Drivers</span>
                      <span className="kpi-value" style={{ color: '#f59e0b' }}>
                        ₹{Math.round(totalDriverPayout).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {totalGross > 0 ? `${Math.round((totalDriverPayout / totalGross) * 100)}% of collection` : '0% of collection'}
                      </span>
                    </div>

                    <div className="card kpi-card">
                      <span className="kpi-label">Direct Vehicle Expenses</span>
                      <span className="kpi-value expenses">₹{Math.round(totalExpensesAll).toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Fuel: ₹{Math.round(totalDailyRunExp)} | Overheads: ₹{Math.round(totalVehicleModuleExp)}
                      </span>
                    </div>

                    <div className="card kpi-card" style={{ borderLeft: `4px solid ${netCompanyProfit >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
                      <span className="kpi-label">Net Company Profit</span>
                      <span className={`kpi-value ${netCompanyProfit >= 0 ? 'profit' : 'expenses'}`}>
                        ₹{Math.round(netCompanyProfit).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: netCompanyProfit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                        {totalGross > 0 ? `${Math.round((netCompanyProfit / totalGross) * 100)}% Net Margin` : '0% Margin'}
                      </span>
                    </div>
                  </section>

                  {/* Platform Aggregator Splits */}
                  <div className="card">
                    <h3 style={{ marginBottom: '14px', fontSize: '15px' }}>Platform Aggregator Splits ({activeRange.label})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <span className="badge badge-ola" style={{ marginBottom: '6px' }}>Ola</span>
                        <h3 style={{ margin: '4px 0', fontSize: '20px' }}>₹{Math.round(olaTotal).toLocaleString('en-IN')}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {totalGross > 0 ? `${Math.round((olaTotal / totalGross) * 100)}%` : '0%'}
                        </span>
                      </div>
                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <span className="badge badge-uber" style={{ marginBottom: '6px' }}>Uber</span>
                        <h3 style={{ margin: '4px 0', fontSize: '20px' }}>₹{Math.round(uberTotal).toLocaleString('en-IN')}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {totalGross > 0 ? `${Math.round((uberTotal / totalGross) * 100)}%` : '0%'}
                        </span>
                      </div>
                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <span className="badge badge-rapido" style={{ marginBottom: '6px' }}>Rapido</span>
                        <h3 style={{ margin: '4px 0', fontSize: '20px' }}>₹{Math.round(rapidoTotal).toLocaleString('en-IN')}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {totalGross > 0 ? `${Math.round((rapidoTotal / totalGross) * 100)}%` : '0%'}
                        </span>
                      </div>
                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <span className="badge badge-private" style={{ marginBottom: '6px' }}>Private Trips</span>
                        <h3 style={{ margin: '4px 0', fontSize: '20px' }}>₹{Math.round(privateTotal).toLocaleString('en-IN')}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {totalGross > 0 ? `${Math.round((privateTotal / totalGross) * 100)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Wise Performance Table */}
                  <div className="card">
                    <h3 style={{ marginBottom: '14px', fontSize: '15px' }}>Vehicle Wise Contributions</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Vehicle Number</th>
                            <th>Model</th>
                            <th>Active Days</th>
                            <th>Gross Collection</th>
                            <th>Driver Payout</th>
                            <th>Expenses</th>
                            <th>Net Company Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(vehicleMap).map(v => (
                            <tr key={v.id}>
                              <td><b>{v.number}</b></td>
                              <td>{v.model}</td>
                              <td>{v.logsCount} day{v.logsCount === 1 ? '' : 's'}</td>
                              <td><b>₹{Math.round(v.gross).toLocaleString('en-IN')}</b></td>
                              <td style={{ color: '#f59e0b' }}>- ₹{Math.round(v.driverPay).toLocaleString('en-IN')}</td>
                              <td style={{ color: 'var(--danger)' }}>₹{Math.round(v.expenses).toLocaleString('en-IN')}</td>
                              <td style={{ color: v.netProfit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                ₹{Math.round(v.netProfit).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Driver Wise Performance Table */}
                  <div className="card">
                    <h3 style={{ marginBottom: '14px', fontSize: '15px' }}>Driver Wise Earnings & Payouts</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Driver Name</th>
                            <th>Mobile</th>
                            <th>Share %</th>
                            <th>Days Worked</th>
                            <th>Total Collection</th>
                            <th>Driver Payment</th>
                            <th>Company Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(driverMap).map(d => (
                            <tr key={d.id}>
                              <td><b>{d.name}</b></td>
                              <td>{d.mobile}</td>
                              <td>{d.sharePct}%</td>
                              <td>{d.logsCount} day{d.logsCount === 1 ? '' : 's'}</td>
                              <td>₹{Math.round(d.gross).toLocaleString('en-IN')}</td>
                              <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                ₹{Math.round(d.payout).toLocaleString('en-IN')}
                              </td>
                              <td style={{ color: d.companyShare >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                ₹{Math.round(d.companyShare).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Itemized Daily Logs for Period */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px' }}>Daily Vehicle Logs in this Period ({filteredEarnings.length})</h3>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={openAddEarning}>
                        <Plus size={14} /> Log Earning
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Vehicle Number</th>
                            <th>Driver Name</th>
                            <th>Ola</th>
                            <th>Uber</th>
                            <th>Rapido</th>
                            <th>Private</th>
                            <th>Gross</th>
                            <th>Driver Payment</th>
                            <th>Expense</th>
                            <th>Daily Profit</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEarnings.map((e) => {
                            const gross = parseFloat(e.total_amount) || 0;
                            const exp = parseFloat(e.expense) || 0;
                            const netAfterExp = Math.max(0, gross - exp);
                            const driverPay = e.driver_share_amount !== undefined
                              ? parseFloat(e.driver_share_amount)
                              : (netAfterExp * (e.driver_share_percentage !== undefined && e.driver_share_percentage !== '' ? parseFloat(e.driver_share_percentage) : 50) / 100);
                            const netProfit = e.net_profit !== undefined ? parseFloat(e.net_profit) : ((gross - exp) - driverPay);

                            return (
                              <tr key={e.id}>
                                <td>{e.date}</td>
                                <td><b>{e.vehicle_number}</b></td>
                                <td>{e.driver_name}</td>
                                <td>₹{e.amount_ola}</td>
                                <td>₹{e.amount_uber}</td>
                                <td>₹{e.amount_rapido}</td>
                                <td>₹{e.amount_private}</td>
                                <td><b>₹{gross.toLocaleString('en-IN')}</b></td>
                                <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                  - ₹{Math.round(driverPay).toLocaleString('en-IN')}
                                </td>
                                <td style={{ color: 'var(--danger)' }}>₹{exp.toLocaleString('en-IN')}</td>
                                <td style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                  ₹{Math.round(netProfit).toLocaleString('en-IN')}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px' }} title="Edit daily entry" onClick={() => openEditEarning(e)}>
                                      <Edit2 size={14} />
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete entry" onClick={() => deleteEarning(e.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredEarnings.length === 0 && (
                            <tr>
                              <td colSpan="12" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                                No daily vehicle earnings recorded for this {periodType}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Itemized Vehicle Expenses for Period */}
                  {filteredExpenses.length > 0 && (
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px' }}>Vehicle Direct Expenses in this Period ({filteredExpenses.length})</h3>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={openAddExpense}>
                          <Plus size={14} /> Log Expense
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Vehicle</th>
                              <th>Category</th>
                              <th>Description</th>
                              <th>Amount</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredExpenses.map((exp) => (
                              <tr key={exp.id}>
                                <td>{exp.date}</td>
                                <td><b>{exp.vehicle_number}</b></td>
                                <td><span className="badge badge-info">{exp.category}</span></td>
                                <td style={{ color: 'var(--text-secondary)' }}>{exp.description || '-'}</td>
                                <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                                  ₹{(parseFloat(exp.amount) || 0).toLocaleString('en-IN')}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditExpense(exp)}>
                                      <Edit2 size={14} />
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteExpense(exp.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. VEHICLE MANAGEMENT */}
            {activeTab === 'vehicles' && (
              <section className="card">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Vehicle Number</th>
                        <th>Model Name</th>
                        <th>Fuel Type</th>
                        <th>Insurance Expiry</th>
                        <th>Fitness Expiry</th>
                        <th>Tax Expiry</th>
                        <th>Permit Expiry</th>
                        <th>PUC Expiry</th>
                        <th>Service Due</th>
                        <th>Tyres Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => {
                        const checkExpiry = (dateStr) => {
                          if (!dateStr) return { style: {}, tag: 'N/A' };
                          const diff = new Date(dateStr) - new Date();
                          const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          if (diffDays < 0) return { style: { color: 'var(--danger)', fontWeight: 'bold' }, tag: 'Expired' };
                          if (diffDays <= 14) return { style: { color: 'var(--warning)', fontWeight: 'bold' }, tag: 'Expiring Soon' };
                          return { style: {}, tag: 'OK' };
                        };

                        return (
                          <tr key={v.id}>
                            <td><b>{v.vehicle_number}</b></td>
                            <td>{v.model_name}</td>
                            <td>
                              <span className={`badge badge-info`}>{v.fuel_type}</span>
                            </td>
                            <td style={checkExpiry(v.insurance_expiry).style}>{v.insurance_expiry}</td>
                            <td style={checkExpiry(v.fitness_expiry).style}>{v.fitness_expiry || 'N/A'}</td>
                            <td style={checkExpiry(v.tax_expiry).style}>{v.tax_expiry || 'N/A'}</td>
                            <td style={checkExpiry(v.permit_expiry).style}>{v.permit_expiry}</td>
                            <td style={checkExpiry(v.puc_expiry).style}>{v.puc_expiry}</td>
                            <td style={checkExpiry(v.service_due).style}>{v.service_due}</td>
                            <td style={checkExpiry(v.tyre_replacement).style}>{v.tyre_replacement}</td>
                            <td>
                              <span className={`badge ${v.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {v.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditVehicle(v)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteVehicle(v.id || v.vehicle_number)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {vehicles.length === 0 && (
                        <tr>
                          <td colSpan="12" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No vehicles registered in fleet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 3. DRIVER MANAGEMENT */}
            {activeTab === 'drivers' && (
              <section className="card">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>Mobile Number</th>
                        <th>License Number</th>
                        <th>Joining Date</th>
                        <th>Share %</th>
                        <th>Assigned Vehicle</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((d) => (
                        <tr key={d.driver_id}>
                          <td><b>{d.name}</b></td>
                          <td>{d.mobile}</td>
                          <td>{d.license_number}</td>
                          <td>{d.joining_date}</td>
                          <td>{d.share_percentage !== undefined ? d.share_percentage : 50}%</td>
                          <td>{d.vehicle_number ? `${d.vehicle_number} (${d.model_name})` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditDriver(d)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteDriver(d.id || d.driver_id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {drivers.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No drivers registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 4. DAILY EARNINGS LOG */}
            {activeTab === 'earnings' && (
              <section className="card">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Ola</th>
                        <th>Uber</th>
                        <th>Rapido</th>
                        <th>Private Trips</th>
                        <th>Gross Total</th>
                        <th>Driver Payment</th>
                        <th>Expense</th>
                        <th>Daily Company Profit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((e) => {
                        const gross = parseFloat(e.total_amount) || 0;
                        const exp = parseFloat(e.expense) || 0;
                        const netAfterExp = Math.max(0, gross - exp);
                        const driverPay = e.driver_share_amount !== undefined 
                          ? parseFloat(e.driver_share_amount) 
                          : (netAfterExp * (e.driver_share_percentage !== undefined && e.driver_share_percentage !== '' ? parseFloat(e.driver_share_percentage) : 50) / 100);
                        const netProfit = e.net_profit !== undefined ? parseFloat(e.net_profit) : ((gross - exp) - driverPay);

                        return (
                          <tr key={e.id}>
                            <td>{e.date}</td>
                            <td><b>{e.vehicle_number}</b></td>
                            <td>{e.driver_name}</td>
                            <td>₹{e.amount_ola}</td>
                            <td>₹{e.amount_uber}</td>
                            <td>₹{e.amount_rapido}</td>
                            <td>₹{e.amount_private}</td>
                            <td><b>₹{gross.toLocaleString('en-IN')}</b></td>
                            <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                              - ₹{Math.round(driverPay).toLocaleString('en-IN')}
                            </td>
                            <td style={{ color: 'var(--danger)' }}>₹{exp.toLocaleString('en-IN')}</td>
                            <td style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                              ₹{Math.round(netProfit).toLocaleString('en-IN')}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '6px' }} title="Edit daily entry" onClick={() => openEditEarning(e)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete entry" onClick={() => deleteEarning(e.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {earnings.length === 0 && (
                        <tr>
                          <td colSpan="12" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No daily earnings entries recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 5. VEHICLE EXPENSES MANAGEMENT */}
            {activeTab === 'expenses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Summary KPI Cards for Expenses */}
                {(() => {
                  const totalExp = expenses.reduce((sum, x) => sum + (parseFloat(x.amount) || 0), 0);
                  const fuelExp = expenses.filter(x => (x.category || '').toLowerCase() === 'fuel' || (x.category || '').toLowerCase() === 'cng')
                                          .reduce((sum, x) => sum + (parseFloat(x.amount) || 0), 0);
                  const maintExp = expenses.filter(x => (x.category || '').toLowerCase() === 'maintenance' || (x.category || '').toLowerCase() === 'service')
                                           .reduce((sum, x) => sum + (parseFloat(x.amount) || 0), 0);
                  const otherExp = totalExp - fuelExp - maintExp;

                  return (
                    <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                      <div className="card kpi-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                        <span className="kpi-label">Total Vehicle Expenses</span>
                        <span className="kpi-value expenses">₹{Math.round(totalExp).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="card kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <span className="kpi-label">Fuel & CNG Outflow</span>
                        <span className="kpi-value" style={{ color: '#ef4444' }}>₹{Math.round(fuelExp).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="card kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <span className="kpi-label">Maintenance & Servicing</span>
                        <span className="kpi-value" style={{ color: '#3b82f6' }}>₹{Math.round(maintExp).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="card kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <span className="kpi-label">Insurance, Tyres & Overheads</span>
                        <span className="kpi-value" style={{ color: '#8b5cf6' }}>₹{Math.round(otherExp).toLocaleString('en-IN')}</span>
                      </div>
                    </section>
                  );
                })()}

                {/* Filters and Actions */}
                <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginRight: '8px' }}>Vehicle:</label>
                      <select
                        className="form-input"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={expenseVehicleFilter}
                        onChange={(e) => setExpenseVehicleFilter(e.target.value)}
                      >
                        <option value="">-- All Vehicles --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model_name})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginRight: '8px' }}>Category:</label>
                      <select
                        className="form-input"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={expenseCategoryFilter}
                        onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                      >
                        <option value="">-- All Categories --</option>
                        <option value="fuel">Fuel / CNG</option>
                        <option value="maintenance">Maintenance & Service</option>
                        <option value="tyres">Tyres Replacement</option>
                        <option value="puncture">Puncture / Repair</option>
                        <option value="insurance">Insurance Renewal</option>
                        <option value="permit">Permit Renewal</option>
                        <option value="toll">Tolls</option>
                        <option value="parking">Parking</option>
                        <option value="other">Other Expenses</option>
                      </select>
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={openAddExpense}>
                    <Plus size={16} /> Log Vehicle Expense
                  </button>
                </div>

                {/* Expenses Table */}
                <section className="card">
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Vehicle Number</th>
                          <th>Vehicle Model</th>
                          <th>Category</th>
                          <th>Description / Notes</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses
                          .filter(x => {
                            if (expenseVehicleFilter && x.vehicle_id !== expenseVehicleFilter) return false;
                            if (expenseCategoryFilter && (x.category || '').toLowerCase() !== expenseCategoryFilter.toLowerCase()) return false;
                            return true;
                          })
                          .map((exp) => {
                            const getCategoryBadge = (cat) => {
                              const c = (cat || '').toLowerCase();
                              if (c === 'fuel' || c === 'cng') return { label: 'Fuel / CNG', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
                              if (c === 'maintenance' || c === 'service') return { label: 'Maintenance', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
                              if (c === 'insurance' || c === 'permit') return { label: 'Insurance / Permit', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
                              if (c === 'tyres' || c === 'puncture') return { label: 'Tyres / Puncture', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
                              if (c === 'toll' || c === 'parking') return { label: 'Toll / Parking', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
                              return { label: cat || 'Other', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
                            };

                            const badge = getCategoryBadge(exp.category);

                            return (
                              <tr key={exp.id}>
                                <td>{exp.date}</td>
                                <td><b>{exp.vehicle_number}</b></td>
                                <td>{exp.model_name || '-'}</td>
                                <td>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: badge.color,
                                    backgroundColor: badge.bg
                                  }}>
                                    {badge.label}
                                  </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{exp.description || '-'}</td>
                                <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                                  ₹{(parseFloat(exp.amount) || 0).toLocaleString('en-IN')}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px' }} title="Edit expense" onClick={() => openEditExpense(exp)}>
                                      <Edit2 size={14} />
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete expense" onClick={() => deleteExpense(exp.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                              No vehicle expenses recorded yet. Click "Log Vehicle Expense" to add maintenance, fuel, or repairs.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}





            {/* 7. BUSINESS REPORTS */}
            {activeTab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Filter */}
                <section className="card no-print">
                  <h3 style={{ marginBottom: '15px' }}>Configure Report Period</h3>
                  <form onSubmit={handleGenerateReport} className="grid-3" style={{ alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-input" value={reportsFilter.start_date} onChange={(e) => setReportsFilter({ ...reportsFilter, start_date: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-input" value={reportsFilter.end_date} onChange={(e) => setReportsFilter({ ...reportsFilter, end_date: e.target.value })} required />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, height: '45px' }}>
                        Generate Report
                      </button>
                      {reportsData && (
                        <>
                          <button type="button" className="btn btn-secondary" style={{ height: '45px' }} onClick={handleExportCSV}>
                            <Download size={16} /> CSV
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ height: '45px' }} onClick={handleExportPDF}>
                            Print PDF
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </section>

                {/* Report Data display */}
                {reportsData && (
                  <div className="print-section" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                      <h2>AC FLEET - FLEET PERFORMANCE REPORT</h2>
                      <p style={{ color: 'var(--text-secondary)' }}>Report Date Range: <b>{reportsData.period.start_date}</b> to <b>{reportsData.period.end_date}</b></p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Revenue</span>
                        <h1 style={{ color: 'var(--primary)' }}>₹{reportsData.totalEarnings.toLocaleString('en-IN')}</h1>
                      </div>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Direct Fleet Expenses</span>
                        <h1 style={{ color: 'var(--danger)' }}>₹{reportsData.totalExpenses.toLocaleString('en-IN')}</h1>
                      </div>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '4px solid #f59e0b' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Paid to Drivers</span>
                        <h1 style={{ color: '#f59e0b' }}>₹{Math.round(reportsData.totalDriverPayout || 0).toLocaleString('en-IN')}</h1>
                      </div>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Net Company Profit</span>
                        <h1 style={{ color: reportsData.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          ₹{Math.round(reportsData.netProfit).toLocaleString('en-IN')}
                        </h1>
                      </div>
                    </div>

                    {/* Platform splits info */}
                    <div className="card">
                      <h3 style={{ marginBottom: '15px' }}>Platform Aggregator Splits</h3>
                      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
                          <span className="badge badge-ola" style={{ marginBottom: '8px' }}>Ola</span>
                          <h3>₹{reportsData.platformBreakdown.ola.toLocaleString('en-IN')}</h3>
                        </div>
                        <div style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
                          <span className="badge badge-uber" style={{ marginBottom: '8px' }}>Uber</span>
                          <h3>₹{reportsData.platformBreakdown.uber.toLocaleString('en-IN')}</h3>
                        </div>
                        <div style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
                          <span className="badge badge-rapido" style={{ marginBottom: '8px' }}>Rapido</span>
                          <h3>₹{reportsData.platformBreakdown.rapido.toLocaleString('en-IN')}</h3>
                        </div>
                        <div style={{ padding: '10px', textAlign: 'center' }}>
                          <span className="badge badge-private" style={{ marginBottom: '8px' }}>Private Trips</span>
                          <h3>₹{reportsData.platformBreakdown.private.toLocaleString('en-IN')}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Performance report */}
                    <div className="card">
                      <h3 style={{ marginBottom: '15px' }}>Vehicle Wise Revenue & Overhead Contributions</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Vehicle Number</th>
                              <th>Model Name</th>
                              <th>Gross Revenue</th>
                              <th>Direct Expenses</th>
                              <th>Net Return</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportsData.vehicleWise.map((v, i) => (
                              <tr key={i}>
                                <td><b>{v.vehicle_number}</b></td>
                                <td>{v.model_name}</td>
                                <td style={{ color: 'var(--success)' }}>₹{v.earnings.toLocaleString('en-IN')}</td>
                                <td style={{ color: 'var(--danger)' }}>₹{v.expenses.toLocaleString('en-IN')}</td>
                                <td><b>₹{(v.earnings - v.expenses).toLocaleString('en-IN')}</b></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Driver performance report */}
                    <div className="card">
                      <h3 style={{ marginBottom: '15px' }}>Driver Wise Earnings Contributions</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Driver Name</th>
                              <th>Mobile</th>
                              <th>Share Percentage</th>
                              <th>Total Revenue Generated</th>
                              <th>Driver Reimbursable Out-of-Pocket Expenses</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportsData.driverWise.map((d, i) => (
                              <tr key={i}>
                                <td><b>{d.name}</b></td>
                                <td>{d.mobile}</td>
                                <td>{d.share_percentage}%</td>
                                <td style={{ color: 'var(--success)' }}>₹{d.total_earnings.toLocaleString('en-IN')}</td>
                                <td>₹{d.driver_paid_expenses.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. ALERTS & NOTIFICATIONS */}
            {activeTab === 'alerts' && (
              <section className="card">
                <div className="alerts-list">
                  {notifications.map((n) => (
                    <div key={n.id} className={`alert-item ${n.type} ${n.read_status === 1 ? 'no-print' : ''}`} style={{ opacity: n.read_status === 1 ? 0.6 : 1 }}>
                      <div className="alert-content">
                        <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge badge-${n.type === 'puc' ? 'warning' : n.type === 'permit' ? 'danger' : n.type === 'payment' ? 'success' : 'info'}`}>
                            {n.type}
                          </span>
                          {n.title}
                        </div>
                        <div className="alert-desc">{n.message}</div>
                        <div className="alert-time">{new Date(n.created_at).toLocaleString('en-IN')}</div>
                      </div>
                      {n.read_status === 0 && (
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => markNotificationRead(n.id)}>
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      <Info size={32} style={{ marginBottom: '10px' }} />
                      <p>No active expiry reminders or alerts.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* --- MODAL DIALOGS --- */}

        {/* Vehicle Save Modal */}
        {vehicleModal.show && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{vehicleModal.mode === 'add' ? 'Add Fleet Vehicle' : 'Edit Vehicle Details'}</h3>
                <button className="modal-close" onClick={() => setVehicleModal({ show: false, mode: 'add', data: null })}><X /></button>
              </div>
              <form onSubmit={saveVehicle}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Vehicle Number</label>
                    <input type="text" className="form-input" placeholder="e.g. MH-12-AB-1234" value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Maruti Suzuki WagonR" value={vehicleForm.model_name} onChange={(e) => setVehicleForm({ ...vehicleForm, model_name: e.target.value })} required />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Fuel Type</label>
                      <select className="form-input" value={vehicleForm.fuel_type} onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })} required>
                        <option value="CNG">CNG</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="EV">EV</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-input" value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })} required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Insurance Expiry Date</label>
                      <input type="date" className="form-input" value={vehicleForm.insurance_expiry} onChange={(e) => setVehicleForm({ ...vehicleForm, insurance_expiry: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Permit Expiry Date</label>
                      <input type="date" className="form-input" value={vehicleForm.permit_expiry} onChange={(e) => setVehicleForm({ ...vehicleForm, permit_expiry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Fitness Expiry Date</label>
                      <input type="date" className="form-input" value={vehicleForm.fitness_expiry || ''} onChange={(e) => setVehicleForm({ ...vehicleForm, fitness_expiry: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tax Expiry Date</label>
                      <input type="date" className="form-input" value={vehicleForm.tax_expiry || ''} onChange={(e) => setVehicleForm({ ...vehicleForm, tax_expiry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">PUC Expiry Date</label>
                      <input type="date" className="form-input" value={vehicleForm.puc_expiry} onChange={(e) => setVehicleForm({ ...vehicleForm, puc_expiry: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Service Due Date</label>
                      <input type="date" className="form-input" value={vehicleForm.service_due} onChange={(e) => setVehicleForm({ ...vehicleForm, service_due: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tyre Replacement Expected Date</label>
                    <input type="date" className="form-input" value={vehicleForm.tyre_replacement} onChange={(e) => setVehicleForm({ ...vehicleForm, tyre_replacement: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setVehicleModal({ show: false, mode: 'add', data: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Vehicle</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Driver Save Modal */}
        {driverModal.show && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{driverModal.mode === 'add' ? 'Register New Driver' : 'Edit Driver Details'}</h3>
                <button className="modal-close" onClick={() => setDriverModal({ show: false, mode: 'add', data: null })}><X /></button>
              </div>
              <form onSubmit={saveDriver}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Driver Name</label>
                    <input type="text" className="form-input" placeholder="Ramesh Kumar" value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} required />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Mobile Number (Login Mobile)</label>
                      <input type="tel" className="form-input" placeholder="e.g. 9000000001" value={driverForm.mobile} onChange={(e) => setDriverForm({ ...driverForm, mobile: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driver Password</label>
                      <input type="password" className="form-input" placeholder={driverModal.mode === 'add' ? 'Set Password' : 'Leave blank to keep same'} value={driverForm.password} onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })} required={driverModal.mode === 'add'} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Driving License Number</label>
                    <input type="text" className="form-input" placeholder="DL-XXXXXXXXXXXXXXXX" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input type="date" className="form-input" value={driverForm.joining_date} onChange={(e) => setDriverForm({ ...driverForm, joining_date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driver Share Percentage</label>
                      <select className="form-input" value={driverForm.share_percentage} onChange={(e) => setDriverForm({ ...driverForm, share_percentage: parseFloat(e.target.value) })} required>
                        <option value="0">0% Share (Fixed Salary / Rental / 100% Company)</option>
                        <option value="30">30% Share</option>
                        <option value="40">40% Share</option>
                        <option value="45">45% Share</option>
                        <option value="50">50% Share</option>
                        <option value="60">60% Share (Custom)</option>
                        <option value="70">70% Share</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Vehicle</label>
                    <select className="form-input" value={driverForm.assigned_vehicle_id} onChange={(e) => setDriverForm({ ...driverForm, assigned_vehicle_id: e.target.value })}>
                      <option value="">-- None Assigned --</option>
                      {vehicles.filter(v => v.status === 'active').map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model_name})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDriverModal({ show: false, mode: 'add', data: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Driver</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Earning Log Modal */}
        {earningModal.show && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {earningModal.mode === 'edit' ? 'Edit Daily Vehicle Earnings' : 'Record Daily Vehicle Earnings'}
                </h3>
                <button className="modal-close" onClick={() => setEarningModal({ show: false, mode: 'add', data: null })}><X /></button>
              </div>
              <form onSubmit={saveEarning}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={earningForm.date} onChange={(e) => setEarningForm({ ...earningForm, date: e.target.value })} required />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Vehicle</label>
                      <select className="form-input" value={earningForm.vehicle_id} onChange={(e) => setEarningForm({ ...earningForm, vehicle_id: e.target.value })} required>
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driver</label>
                      <select className="form-input" value={earningForm.driver_id} onChange={(e) => setEarningForm({ ...earningForm, driver_id: e.target.value })} required>
                        <option value="">-- Select Driver --</option>
                        {drivers.map(d => (
                          <option key={d.driver_id || d.id} value={d.driver_id || d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Aggregator Splits:</span>
                  </div>

                  <div className="grid-2" style={{ marginTop: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Ola Earnings (₹)</label>
                      <input type="number" className="form-input" placeholder="0" value={earningForm.amount_ola} onChange={(e) => setEarningForm({ ...earningForm, amount_ola: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Uber Earnings (₹)</label>
                      <input type="number" className="form-input" placeholder="0" value={earningForm.amount_uber} onChange={(e) => setEarningForm({ ...earningForm, amount_uber: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Rapido Earnings (₹)</label>
                      <input type="number" className="form-input" placeholder="0" value={earningForm.amount_rapido} onChange={(e) => setEarningForm({ ...earningForm, amount_rapido: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Private Trip Earnings (₹)</label>
                      <input type="number" className="form-input" placeholder="0" value={earningForm.amount_private} onChange={(e) => setEarningForm({ ...earningForm, amount_private: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Expenses (Fuel / CNG for this run):</span>
                  </div>

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label">Expense (₹)</label>
                    <input type="number" className="form-input" placeholder="0" value={earningForm.expense} onChange={(e) => setEarningForm({ ...earningForm, expense: e.target.value })} />
                  </div>

                  {/* Live Profit Calculation */}
                  {(() => {
                    const gross = (parseFloat(earningForm.amount_ola) || 0) +
                                  (parseFloat(earningForm.amount_uber) || 0) +
                                  (parseFloat(earningForm.amount_rapido) || 0) +
                                  (parseFloat(earningForm.amount_private) || 0);
                    const exp = parseFloat(earningForm.expense) || 0;
                    
                    const selectedDriver = drivers.find(d => d.id === earningForm.driver_id || d.driver_id === earningForm.driver_id);
                    const sharePct = (selectedDriver && selectedDriver.share_percentage !== undefined && selectedDriver.share_percentage !== '') ? parseFloat(selectedDriver.share_percentage) : 50;

                    // Driver payment is calculated AFTER deducting expenses
                    const netAfterExpense = Math.max(0, gross - exp);
                    const driverPayout = (netAfterExpense * sharePct) / 100;
                    const dailyProfit = (gross - exp) - driverPayout;

                    return (
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>Gross Earnings:</span>
                          <b>₹{gross.toLocaleString('en-IN')}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--danger)' }}>
                          <span>Expense (Fuel / CNG):</span>
                          <b>- ₹{exp.toLocaleString('en-IN')}</b>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: '#3b82f6',
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '6px'
                        }}>
                          <span>Amount After Expense:</span>
                          <b>₹{netAfterExpense.toLocaleString('en-IN')}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#f59e0b' }}>
                          <span>Driver Payment ({sharePct}% of Net):</span>
                          <b>- ₹{Math.round(driverPayout).toLocaleString('en-IN')}</b>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '8px',
                          fontSize: '16px',
                          color: dailyProfit >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          <span>Daily Company Profit:</span>
                          <span>₹{Math.round(dailyProfit).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEarningModal({ show: false, mode: 'add', data: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {earningModal.mode === 'edit' ? 'Update Log' : 'Save Log'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Log Modal */}
        {expenseModal.show && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {expenseModal.mode === 'edit' ? 'Edit Vehicle Expense' : 'Record Vehicle Expense'}
                </h3>
                <button className="modal-close" onClick={() => setExpenseModal({ show: false, mode: 'add', data: null })}><X /></button>
              </div>
              <form onSubmit={saveExpense}>
                <div className="modal-body">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expense Category</label>
                      <select className="form-input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} required>
                        <option value="fuel">Fuel / CNG</option>
                        <option value="maintenance">Maintenance & Service</option>
                        <option value="tyres">Tyres Replacement</option>
                        <option value="puncture">Puncture / Repair</option>
                        <option value="insurance">Insurance Renewal</option>
                        <option value="permit">Permit Renewal</option>
                        <option value="toll">Tolls</option>
                        <option value="parking">Parking</option>
                        <option value="other">Other Expenses</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Select Vehicle</label>
                      <select className="form-input" value={expenseForm.vehicle_id} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })} required>
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount (₹)</label>
                      <input type="number" className="form-input" placeholder="e.g. 1500" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Remarks</label>
                    <input type="text" className="form-input" placeholder="e.g. Engine oil change & filter replacement" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setExpenseModal({ show: false, mode: 'add', data: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {expenseModal.mode === 'edit' ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}



        {/* Admin Credentials Modal */}
        {adminModal && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '420px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Change Admin Login Details</h3>
                <button className="modal-close" onClick={() => setAdminModal(false)}><X /></button>
              </div>
              <form onSubmit={handleUpdateAdminCreds}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={adminCredsForm.name}
                      onChange={(e) => setAdminCredsForm({ ...adminCredsForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Login Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 8104517652"
                      value={adminCredsForm.mobile}
                      onChange={(e) => setAdminCredsForm({ ...adminCredsForm, mobile: e.target.value })}
                      required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      This mobile number is used to log in to the Admin Portal.
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password"
                      value={adminCredsForm.password}
                      onChange={(e) => setAdminCredsForm({ ...adminCredsForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Confirm new password"
                      value={adminCredsForm.confirmPassword}
                      onChange={(e) => setAdminCredsForm({ ...adminCredsForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setAdminModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save New Details</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receipt Image Viewer Modal */}
        {receiptViewer.show && (
          <div className="modal-backdrop" onClick={() => setReceiptViewer({ show: false, path: '' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Receipt Photo Preview</h3>
                <button className="modal-close" onClick={() => setReceiptViewer({ show: false, path: '' })}><X /></button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center', overflow: 'hidden' }}>
                <img
                  src={`http://localhost:5001${receiptViewer.path}`}
                  alt="Expense Receipt"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Receipt+Not+Found'; }}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReceiptViewer({ show: false, path: '' })}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
