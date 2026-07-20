import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import {
  LayoutDashboard, Car, Users, IndianRupee, AlertTriangle, TrendingUp, Plus,
  Edit2, Trash2, LogOut, Sun, Moon, FileText, Check, X, Eye, Download, Bell, Info
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

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
  const [earningModal, setEarningModal] = useState({ show: false });
  const [expenseModal, setExpenseModal] = useState({ show: false });
  const [settleModal, setSettleModal] = useState({ show: false, calculation: null });
  const [receiptViewer, setReceiptViewer] = useState({ show: false, path: '' });

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: '', model_name: '', fuel_type: 'CNG',
    insurance_expiry: '', permit_expiry: '', puc_expiry: '',
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
  const [settleForm, setSettleForm] = useState({
    driver_id: '', date: new Date().toISOString().split('T')[0]
  });
  const [paySettlementForm, setPaySettlementForm] = useState({
    id: null, paid_to: ''
  });
  const [settleFields, setSettleFields] = useState({
    paid_to_driver: 0,
    paid_to: 'bank of india',
    status: 'paid'
  });

  // Reports state
  const [reportsFilter, setReportsFilter] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [reportsData, setReportsData] = useState(null);

  // Fetch all administrative data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch core dashboard details
      const statsRes = await fetch(`${API_BASE_URL}/owner/stats`, { headers });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Fleet list
      const vehiclesRes = await fetch(`${API_BASE_URL}/owner/vehicles`, { headers });
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData);

      // Fetch Driver registry
      const driversRes = await fetch(`${API_BASE_URL}/owner/drivers`, { headers });
      const driversData = await driversRes.json();
      setDrivers(driversData);

      // Fetch Log summaries
      const earningsRes = await fetch(`${API_BASE_URL}/owner/earnings`, { headers });
      const earningsData = await earningsRes.json();
      setEarnings(earningsData);

      const expensesRes = await fetch(`${API_BASE_URL}/owner/expenses`, { headers });
      const expensesData = await expensesRes.json();
      setExpenses(expensesData);

      const settlementsRes = await fetch(`${API_BASE_URL}/owner/settlements`, { headers });
      const settlementsData = await settlementsRes.json();
      setSettlements(settlementsData);

      const notificationsRes = await fetch(`${API_BASE_URL}/owner/notifications`, { headers });
      const notificationsData = await notificationsRes.json();
      setNotifications(notificationsData);

    } catch (err) {
      console.error(err);
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
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE_URL}/owner/reports?start_date=${reportsFilter.start_date}&end_date=${reportsFilter.end_date}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReportsData(data);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      handleGenerateReport();
    }
  }, [activeTab]);

  // --- CRUD FUNCTIONS ---

  // Vehicles
  const saveVehicle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = vehicleModal.mode === 'add' ? 'POST' : 'PUT';
    const url = vehicleModal.mode === 'add' 
      ? `${API_BASE_URL}/owner/vehicles` 
      : `${API_BASE_URL}/owner/vehicles/${vehicleModal.data.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setVehicleModal({ show: false, mode: 'add', data: null });
      fetchData();
      alert(data.message || 'Vehicle saved!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to remove this vehicle? All linked earnings and expenses will be deleted.')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Drivers
  const saveDriver = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = driverModal.mode === 'add' ? 'POST' : 'PUT';
    const url = driverModal.mode === 'add' 
      ? `${API_BASE_URL}/owner/drivers` 
      : `${API_BASE_URL}/owner/drivers/${driverModal.data.driver_id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(driverForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setDriverModal({ show: false, mode: 'add', data: null });
      fetchData();
      alert(data.message || 'Driver saved!');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to remove this driver? Driver account access will be revoked.')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/drivers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Earnings
  const saveEarning = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(earningForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setEarningModal({ show: false });
      setEarningForm({
        date: new Date().toISOString().split('T')[0], vehicle_id: '', driver_id: '',
        amount_ola: '', amount_uber: '', amount_rapido: '', amount_private: '',
        expense: ''
      });
      fetchData();
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEarning = async (id) => {
    if (!confirm('Are you sure you want to delete this earning entry?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/owner/earnings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Expenses
  const saveExpense = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setExpenseModal({ show: false });
      setExpenseForm({
        date: new Date().toISOString().split('T')[0], vehicle_id: '', driver_id: '',
        category: 'fuel', amount: '', description: ''
      });
      fetchData();
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateExpenseStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/expenses/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/owner/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Settlements
  const calculateSettlement = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE_URL}/owner/settlements/calculate?driver_id=${settleForm.driver_id}&date=${settleForm.date}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      const data = await response.json();
      setSettleModal({ show: true, calculation: data });
      setSettleFields({
        paid_to_driver: data.driverShare,
        paid_to: 'bank of india',
        status: 'paid'
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const saveSettlement = async () => {
    const token = localStorage.getItem('token');
    const payload = {
      date: settleForm.date,
      driver_id: settleForm.driver_id,
      total_earnings: settleModal.calculation.totalEarnings,
      fuel_expenses: settleModal.calculation.fuelExpenses,
      other_expenses: settleModal.calculation.otherExpenses,
      amount_after_expenses: settleModal.calculation.amountAfterExpenses,
      driver_percentage: settleModal.calculation.driverPercentage,
      driver_share: settleModal.calculation.driverShare,
      owner_share: settleModal.calculation.ownerShare,
      paid_to_driver: parseFloat(settleFields.paid_to_driver) || 0,
      owner_net: settleModal.calculation.amountAfterExpenses - (parseFloat(settleFields.paid_to_driver) || 0),
      paid_to: settleFields.paid_to,
      status: settleFields.status
    };

    try {
      const response = await fetch(`${API_BASE_URL}/owner/settlements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSettleModal({ show: false, calculation: null });
      setSettleForm({ driver_id: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
      alert('Settlement recorded successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const paySettlement = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/owner/settlements/${paySettlementForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paid_to: paySettlementForm.paid_to })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPaySettlementForm({ id: null, paid_to: '' });
      fetchData();
      alert('Settlement marked as PAID.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/owner/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // --- EXPORT FUNCTIONALITY ---

  // Export reports to CSV
  const handleExportCSV = () => {
    if (!reportsData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Overall Stats
    csvContent += "ATHARVA ENTERPRISES - FLEET PERFORMANCE REPORT\n";
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
      insurance_expiry: '', permit_expiry: '', puc_expiry: '',
      service_due: '', tyre_replacement: '', status: 'active'
    });
    setVehicleModal({ show: true, mode: 'add', data: null });
  };

  const openEditVehicle = (v) => {
    setVehicleForm({
      vehicle_number: v.vehicle_number, model_name: v.model_name, fuel_type: v.fuel_type,
      insurance_expiry: v.insurance_expiry, permit_expiry: v.permit_expiry, puc_expiry: v.puc_expiry,
      service_due: v.service_due, tyre_replacement: v.tyre_replacement, status: v.status
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
      joining_date: d.joining_date, share_percentage: d.share_percentage,
      assigned_vehicle_id: d.assigned_vehicle_id || '', user_id: d.user_id
    });
    setDriverModal({ show: true, mode: 'edit', data: d });
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

    // Doughnut Chart: Expenses by Category
    const doughnutData = {
      labels: categoryExpenses.map(c => c.category.toUpperCase()),
      datasets: [
        {
          data: categoryExpenses.map(c => c.total),
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'],
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
            <h3 className="chart-title">Expenses by Category</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryExpenses.length > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>No expenses recorded this month.</p>
            )}
          </div>
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
        <div className="sidebar-brand">
          <h2 className="sidebar-title">Atharva Ent.</h2>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fleet Admin Portal</span>
        </div>
        
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <a className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} />
              Dashboard
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
            <a className={`sidebar-link ${activeTab === 'settlements' ? 'active' : ''}`} onClick={() => setActiveTab('settlements')}>
              <Check size={18} />
              Driver Settlements
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
              {activeTab === 'vehicles' && 'Manage Vehicles'}
              {activeTab === 'drivers' && 'Manage Drivers'}
              {activeTab === 'earnings' && 'Earnings Registry'}
              {activeTab === 'expenses' && 'Expenses Management'}
              {activeTab === 'settlements' && 'Driver Settlement Auditing'}
              {activeTab === 'reports' && 'Financial Reports & Analytics'}
              {activeTab === 'alerts' && 'System alerts & Expiries'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Atharva Enterprises Taxi Business Console</p>
          </div>
          
          <div className="nav-actions">
            {activeTab === 'dashboard' && (
              <span style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '20px' }}>
                Today: <b>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
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
              <button className="btn btn-primary" onClick={() => setEarningModal({ show: true })}>
                <Plus size={16} /> Log Daily Earnings
              </button>
            )}
            {activeTab === 'expenses' && (
              <button className="btn btn-primary" onClick={() => setExpenseModal({ show: true })}>
                <Plus size={16} /> Log Expense
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
                    <span className="kpi-label">Today's Earnings</span>
                    <span className="kpi-value earnings">₹{stats.kpis.earningsToday.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Today's Expenses</span>
                    <span className="kpi-value expenses">₹{stats.kpis.expensesToday.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Today's Profit</span>
                    <span className={`kpi-value profit ${stats.kpis.netProfitToday < 0 ? 'expenses' : ''}`}>
                      ₹{stats.kpis.netProfitToday.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Earnings</span>
                    <span className="kpi-value earnings">₹{stats.kpis.earningsMonth.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Expenses</span>
                    <span className="kpi-value expenses">₹{stats.kpis.expensesMonth.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="card kpi-card">
                    <span className="kpi-label">Month's Profit</span>
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
                                <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteVehicle(v.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {vehicles.length === 0 && (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No vehicles registered in fleet.</td>
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
                          <td>{d.share_percentage}%</td>
                          <td>{d.vehicle_number ? `${d.vehicle_number} (${d.model_name})` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditDriver(d)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteDriver(d.driver_id)}>
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
                        <th>Total Earnings</th>
                        <th>Expense</th>
                        <th>Daily Profit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((e) => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <td><b>{e.vehicle_number}</b></td>
                          <td>{e.driver_name}</td>
                          <td>₹{e.amount_ola}</td>
                          <td>₹{e.amount_uber}</td>
                          <td>₹{e.amount_rapido}</td>
                          <td>₹{e.amount_private}</td>
                          <td><b>₹{e.total_amount}</b></td>
                          <td style={{ color: 'var(--danger)' }}>₹{e.expense}</td>
                          <td style={{ color: e.total_amount - e.expense >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                            ₹{(e.total_amount - e.expense).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteEarning(e.id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {earnings.length === 0 && (
                        <tr>
                          <td colSpan="11" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No daily earnings entries recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}



            {/* 6. DRIVER SETTLEMENTS */}
            {activeTab === 'settlements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Generate New Settlement form */}
                <section className="card">
                  <h3 style={{ marginBottom: '15px' }}>Calculate & Generate Settlement</h3>
                  <form onSubmit={calculateSettlement} className="grid-3" style={{ alignItems: 'flex-end', gridTemplateColumns: '2fr 2fr 1fr' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Select Driver</label>
                      <select className="form-input" value={settleForm.driver_id} onChange={(e) => setSettleForm({ ...settleForm, driver_id: e.target.value })} required>
                        <option value="">-- Select Driver --</option>
                        {drivers.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name} ({d.share_percentage}% share)</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Settlement Date</label>
                      <input type="date" className="form-input" value={settleForm.date} onChange={(e) => setSettleForm({ ...settleForm, date: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '45px', width: '100%' }}>
                      Calculate Splits
                    </button>
                  </form>
                </section>

                {/* Settlements Ledger List */}
                <section className="card">
                  <h3 style={{ marginBottom: '15px' }}>Settlements Ledger</h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Driver Name</th>
                          <th>Total Earnings ₹</th>
                          <th>Fuel ₹</th>
                          <th>Other Expenses ₹</th>
                          <th>Amount After Expenses ₹</th>
                          <th>Driver %</th>
                          <th>Driver Share ₹</th>
                          <th>My Share ₹</th>
                          <th>Paid to driver ₹</th>
                          <th>owner ₹</th>
                          <th>paid to</th>
                          <th>status</th>
                          <th className="no-print">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settlements.map((s) => (
                          <tr key={s.id}>
                            <td>{s.date.split('-').reverse().join('/')}</td>
                            <td><b>{s.driver_name}</b></td>
                            <td>₹{s.total_earnings.toLocaleString('en-IN')}</td>
                            <td>₹{s.fuel_expenses.toLocaleString('en-IN')}</td>
                            <td>₹{s.other_expenses.toLocaleString('en-IN')}</td>
                            <td>₹{s.amount_after_expenses.toLocaleString('en-IN')}</td>
                            <td>{s.driver_percentage}%</td>
                            <td>₹{s.driver_share.toLocaleString('en-IN')}</td>
                            <td>₹{s.owner_share.toLocaleString('en-IN')}</td>
                            <td><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{s.paid_to_driver.toLocaleString('en-IN')}</span></td>
                            <td><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{s.owner_net.toLocaleString('en-IN')}</span></td>
                            <td>{s.paid_to ? <code>{s.paid_to}</code> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                            <td>
                              <span className={`badge ${s.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="no-print">
                              {s.status === 'pending' ? (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--success)' }} onClick={() => setPaySettlementForm({ id: s.id, paid_to: '' })}>
                                  Mark Paid
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Settled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {settlements.length === 0 && (
                          <tr>
                            <td colSpan="14" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No settlements generated yet.</td>
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
                      <h2>ATHARVA ENTERPRISES - FLEET PERFORMANCE</h2>
                      <p style={{ color: 'var(--text-secondary)' }}>Report Date Range: <b>{reportsData.period.start_date}</b> to <b>{reportsData.period.end_date}</b></p>
                    </div>

                    <div className="grid-3">
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Revenue</span>
                        <h1 style={{ color: 'var(--primary)' }}>₹{reportsData.totalEarnings.toLocaleString('en-IN')}</h1>
                      </div>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Approved Expenses</span>
                        <h1 style={{ color: 'var(--danger)' }}>₹{reportsData.totalExpenses.toLocaleString('en-IN')}</h1>
                      </div>
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Net Company Profit</span>
                        <h1 style={{ color: 'var(--success)' }}>₹{reportsData.netProfit.toLocaleString('en-IN')}</h1>
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
                        <option value="40">40% Share</option>
                        <option value="50">50% Share</option>
                        <option value="30">30% Share</option>
                        <option value="45">45% Share</option>
                        <option value="60">60% Share (Custom)</option>
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
                <h3 className="modal-title">Record Daily Vehicle Earnings</h3>
                <button className="modal-close" onClick={() => setEarningModal({ show: false })}><X /></button>
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
                          <option key={v.id} value={v.id}>{v.vehicle_number}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driver</label>
                      <select className="form-input" value={earningForm.driver_id} onChange={(e) => setEarningForm({ ...earningForm, driver_id: e.target.value })} required>
                        <option value="">-- Select Driver --</option>
                        {drivers.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
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
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Expenses:</span>
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
                    const profit = gross - exp;
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
                          <span>Expense:</span>
                          <b>- ₹{exp.toLocaleString('en-IN')}</b>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '8px',
                          fontSize: '16px',
                          color: profit >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          <span>Daily Profit:</span>
                          <span>₹{profit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEarningModal({ show: false })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Log</button>
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
                <h3 className="modal-title">Record Fleet Expense</h3>
                <button className="modal-close" onClick={() => setExpenseModal({ show: false })}><X /></button>
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
                        <option value="toll">Tolls</option>
                        <option value="parking">Parking</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="puncture">Puncture</option>
                        <option value="insurance">Insurance Renewal</option>
                        <option value="permit">Permit Renewal</option>
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
                          <option key={v.id} value={v.id}>{v.vehicle_number}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Select Driver</label>
                      <select className="form-input" value={expenseForm.driver_id} onChange={(e) => setExpenseForm({ ...expenseForm, driver_id: e.target.value })} required>
                        <option value="">-- Select Driver --</option>
                        {drivers.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 500" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Remarks</label>
                    <input type="text" className="form-input" placeholder="CNG refill at Auto pump" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setExpenseModal({ show: false })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Expense</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settlement Split Calculation Preview Modal */}
        {settleModal.show && settleModal.calculation && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Record Settlement & Payout Splits</h3>
                <button className="modal-close" onClick={() => setSettleModal({ show: false, calculation: null })}><X /></button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calculation Date:</span>
                  <p style={{ fontWeight: 'bold' }}>{settleForm.date}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span>Total Earnings:</span>
                  <b>₹{settleModal.calculation.totalEarnings.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span>Fuel Expenses:</span>
                  <b>- ₹{settleModal.calculation.fuelExpenses.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span>Other Expenses:</span>
                  <b>- ₹{settleModal.calculation.otherExpenses.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontWeight: 'bold' }}>
                  <span>Amount After Expenses:</span>
                  <b>₹{settleModal.calculation.amountAfterExpenses.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span>Driver Share ({settleModal.calculation.driverPercentage}%):</span>
                  <b>₹{settleModal.calculation.driverShare.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span>My Share (Owner):</span>
                  <b>₹{settleModal.calculation.ownerShare.toLocaleString('en-IN')}</b>
                </div>

                <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Paid to Driver (₹) - <i>Adjust if rounded/bonus</i></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={settleFields.paid_to_driver}
                      onChange={(e) => setSettleFields({ ...settleFields, paid_to_driver: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Paid To (Bank / Payment Method)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="bank of india"
                      value={settleFields.paid_to}
                      onChange={(e) => setSettleFields({ ...settleFields, paid_to: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Payment Status</label>
                    <select
                      className="form-input"
                      value={settleFields.status}
                      onChange={(e) => setSettleFields({ ...settleFields, status: e.target.value })}
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid var(--primary)', fontSize: '18px', marginTop: '10px' }}>
                  <span>Owner Net (owner):</span>
                  <b style={{ color: 'var(--success)' }}>
                    ₹{(settleModal.calculation.amountAfterExpenses - settleFields.paid_to_driver).toLocaleString('en-IN')}
                  </b>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSettleModal({ show: false, calculation: null })}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={saveSettlement}>Save Settlement</button>
              </div>
            </div>
          </div>
        )}

        {/* Record Settlement Payment Modal */}
        {paySettlementForm.id && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Record Payout Payment</h3>
                <button className="modal-close" onClick={() => setPaySettlementForm({ id: null, paid_to: '' })}><X /></button>
              </div>
              <form onSubmit={paySettlement}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Paid To (Bank / Payment Method)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="bank of india"
                      value={paySettlementForm.paid_to}
                      onChange={(e) => setPaySettlementForm({ ...paySettlementForm, paid_to: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setPaySettlementForm({ id: null, paid_to: '' })}>Close</button>
                  <button type="submit" className="btn btn-primary">Mark as Paid</button>
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
