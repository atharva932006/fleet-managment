import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import {
  Car, IndianRupee, FileText, Upload, Plus, LogOut, Sun, Moon,
  CheckCircle, Clock, XCircle, AlertTriangle, Eye, Image
} from 'lucide-react';

const DriverDashboard = ({ toggleTheme, darkMode }) => {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submit Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: '',
    description: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Active sub-view tab in mobile shell
  const [activeSubTab, setActiveSubTab] = useState('home'); // 'home', 'expense', 'history'
  const [receiptViewer, setReceiptViewer] = useState({ show: false, path: '' });

  const fetchDriverData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Stats
      const statsRes = await fetch(`${API_BASE_URL}/driver/stats`, { headers });
      if (!statsRes.ok) throw new Error('Failed to load stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Assigned Vehicle
      const vehicleRes = await fetch(`${API_BASE_URL}/driver/vehicle`, { headers });
      const vehicleData = await vehicleRes.json();
      setVehicle(vehicleData);

      // Expense History
      const expensesRes = await fetch(`${API_BASE_URL}/driver/expenses`, { headers });
      const expensesData = await expensesRes.json();
      setExpenses(expensesData);

      // Payments Settlements
      const paymentsRes = await fetch(`${API_BASE_URL}/driver/payments`, { headers });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);

    } catch (err) {
      console.error(err);
      setError('Failed to refresh data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [activeSubTab]);

  // Handle Photo selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  // Submit Expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('date', expenseForm.date);
    formData.append('category', expenseForm.category);
    formData.append('amount', expenseForm.amount);
    formData.append('description', expenseForm.description);
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/driver/expense`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      alert('Expense submitted successfully for Owner review.');
      
      // Reset form
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        category: 'fuel',
        amount: '',
        description: ''
      });
      setReceiptFile(null);
      setReceiptPreview('');
      setActiveSubTab('home'); // Go back home
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Expiry check helper
  const renderExpiryReminder = (dateStr, label) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 14) {
      return (
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginTop: '10px'
        }}>
          <AlertTriangle size={16} />
          <span><b>{label} reminder:</b> Expiring in {diffDays < 0 ? `${Math.abs(diffDays)} days ago` : `${diffDays} days`} ({dateStr})</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="driver-shell">
      {/* Mobile Header */}
      <header className="driver-header">
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Driver Dashboard</span>
          <h2 className="driver-name">{user?.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={toggleTheme}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-danger" style={{ padding: '8px' }} onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Stats Quick Grid */}
      {stats && activeSubTab === 'home' && (
        <section className="driver-card-grid">
          <div className="card driver-stat-card" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>Today's Revenue</span>
            <h2 style={{ color: 'var(--primary)', marginTop: '5px' }}>₹{stats.todayEarnings}</h2>
          </div>
          <div className="card driver-stat-card" style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)' }}>
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Month's Revenue</span>
            <h2 style={{ color: 'var(--success)', marginTop: '5px' }}>₹{stats.monthlyEarnings}</h2>
          </div>
          <div className="card driver-stat-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Share ({stats.sharePercentage}%)</span>
              <h2 style={{ color: 'var(--text-primary)', marginTop: '2px' }}>₹{stats.estimatedShareMonth}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 'bold' }}>Unpaid Settlement</span>
              <h2 style={{ color: 'var(--danger)', marginTop: '2px' }}>₹{stats.pendingPayout}</h2>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Navigation Tabs */}
      <nav style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        backgroundColor: 'var(--bg-secondary)', padding: '6px', borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <button
          className={`btn ${activeSubTab === 'home' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('home')}
          style={{ padding: '8px 0', fontSize: '13px' }}
        >
          My Vehicle
        </button>
        <button
          className={`btn ${activeSubTab === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('expense')}
          style={{ padding: '8px 0', fontSize: '13px' }}
        >
          <Plus size={14} /> Submit Expense
        </button>
        <button
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('history')}
          style={{ padding: '8px 0', fontSize: '13px' }}
        >
          History
        </button>
      </nav>

      {/* Tab 1: Home (Assigned Vehicle Details) */}
      {activeSubTab === 'home' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
              <div style={{ width: '30px', height: '30px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {vehicle ? (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                      <Car size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned Vehicle</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{vehicle.vehicle_number}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{vehicle.model_name} • <span style={{ color: 'var(--info)' }}>{vehicle.fuel_type}</span></p>
                    </div>
                  </div>

                  {/* Expiry alerts for driver */}
                  {renderExpiryReminder(vehicle.insurance_expiry, 'Insurance')}
                  {renderExpiryReminder(vehicle.permit_expiry, 'Permit')}
                  {renderExpiryReminder(vehicle.puc_expiry, 'PUC')}
                  {renderExpiryReminder(vehicle.service_due, 'Service Due')}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Car size={40} style={{ marginBottom: '10px' }} />
                  <p>No vehicle assigned. Please ask the owner to assign you a vehicle.</p>
                </div>
              )}

              {/* Settlement Reminders if pending */}
              {stats && stats.pendingPayout > 0 && (
                <div style={{
                  display: 'flex', gap: '10px', backgroundColor: 'var(--warning-light)',
                  border: '1px solid var(--warning)', borderRadius: '12px', padding: '15px'
                }}>
                  <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--warning)' }}>Payment Due</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>You have a pending settlement payout of <b>₹{stats.pendingPayout}</b> from the owner.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Tab 2: Submit Expense Form */}
      {activeSubTab === 'expense' && (
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Report Daily Expense</h3>
          
          {!vehicle ? (
            <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>
              ⚠️ You must be assigned a vehicle by the owner to report expenses.
            </div>
          ) : (
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Expense Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select
                  className="form-input"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  required
                >
                  <option value="fuel">Fuel / CNG Refill</option>
                  <option value="toll">Toll / Fastag</option>
                  <option value="parking">Parking Charges</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount Spent (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 800"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Gas pump refill CNG"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>

              {/* Receipt File Upload */}
              <div className="form-group">
                <label className="form-label">Upload Receipt Photo (Recommended)</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      opacity: 0, cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Image size={24} />
                    <span style={{ fontSize: '13px' }}>Click to Take Photo or Select File</span>
                  </div>
                </div>
                {receiptPreview && (
                  <div style={{ marginTop: '10px', position: 'relative' }}>
                    <img src={receiptPreview} alt="Receipt Preview" className="receipt-preview" />
                    <button
                      type="button"
                      onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                      style={{
                        position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#fff', border: 'none', borderRadius: '50%', padding: '4px'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit Expense Request'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: History (Submitted Expenses & Settlements) */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Submitted Expenses list */}
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>My Submitted Expenses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenses.map((ex) => (
                <div key={ex.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.date}</span>
                    <h4 style={{ textTransform: 'capitalize' }}>{ex.category}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ex.description || 'No description'}</p>
                    {ex.receipt_path && (
                      <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '11px', marginTop: '5px' }} onClick={() => setReceiptViewer({ show: true, path: ex.receipt_path })}>
                        <Eye size={10} style={{ marginRight: '4px' }} /> View Image
                      </button>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ display: 'block' }}>₹{ex.amount}</b>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginTop: '4px' }}>
                      {ex.status === 'approved' && <CheckCircle size={12} style={{ color: 'var(--success)' }} />}
                      {ex.status === 'pending' && <Clock size={12} style={{ color: 'var(--warning)' }} />}
                      {ex.status === 'rejected' && <XCircle size={12} style={{ color: 'var(--danger)' }} />}
                      <span style={{
                        textTransform: 'uppercase', fontWeight: 'bold',
                        color: ex.status === 'approved' ? 'var(--success)' : ex.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                      }}>{ex.status}</span>
                    </span>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No expenses reported yet.</p>
              )}
            </div>
          </div>

          {/* Settlements list */}
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>My Payout Settlements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {payments.map((p) => (
                <div key={p.id} style={{
                  padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px',
                  borderLeft: `4px solid ${p.status === 'paid' ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Date: {p.date}</span>
                    <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Calculated Share:</span>
                    <span>₹{p.driver_share}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Fuel Expenses:</span>
                    <span>₹{p.fuel_expenses}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Other Expenses:</span>
                    <span>₹{p.other_expenses}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', marginTop: '5px', paddingTop: '5px' }}>
                    <span>Paid to Driver:</span>
                    <span style={{ color: p.status === 'paid' ? 'var(--success)' : 'var(--primary)' }}>₹{p.paid_to_driver}</span>
                  </div>
                  {p.status === 'paid' && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Paid to: <b>{p.paid_to || 'bank of india'}</b>
                    </div>
                  )}
                </div>
              ))}
              {payments.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No settlement records found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Viewer Modal */}
      {receiptViewer.show && (
        <div className="modal-backdrop" onClick={() => setReceiptViewer({ show: false, path: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px', margin: '20px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Receipt Photo</h3>
              <button className="modal-close" onClick={() => setReceiptViewer({ show: false, path: '' })}><XCircle size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '16px' }}>
              <img
                src={`http://localhost:5001${receiptViewer.path}`}
                alt="Receipt"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
                onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found'; }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-block" onClick={() => setReceiptViewer({ show: false, path: '' })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
