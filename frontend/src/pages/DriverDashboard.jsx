import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDriverDashboardData } from '../firebase/services';
import acLogo from '../assets/logo.png';
import {
  Car, IndianRupee, Calendar, TrendingUp, LogOut, Sun, Moon,
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, Globe
} from 'lucide-react';

const DriverDashboard = ({ toggleTheme, darkMode, onNavigateToAbout }) => {
  const { logout, user } = useAuth();
  const [data, setData] = useState({
    todayEarnings: 0,
    monthEarnings: 0,
    logs: [],
    driverDetails: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDriverDashboardData(user?.driver_id || user?.id, user?.mobile);
      setData(result);
    } catch (err) {
      console.error("Error loading driver data:", err);
      setError("Unable to load earnings data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const driver = data.driverDetails || user;
  const sharePercentage = driver?.share_percentage || 50;

  return (
    <div className="driver-shell" style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      {/* Brand Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <img
          src={acLogo}
          alt="AC Fleet"
          style={{ maxWidth: '180px', width: '100%', height: 'auto', display: 'inline-block' }}
        />
      </div>

      {/* Mobile Header */}
      <header className="driver-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Driver Portal (Read-Only)
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
            {driver?.name || 'Driver'}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            📱 {driver?.mobile || user?.mobile}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            onClick={logout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          marginBottom: '16px',
          borderLeft: '4px solid #ef4444'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>Loading your earnings...</p>
        </div>
      ) : (
        <>
          {/* Top Primary Earnings Cards */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* Today's Earning */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1' }}>Today's Earning</span>
                <Clock size={16} color="#6366f1" />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#6366f1' }}>
                ₹{Math.round(data.todayEarnings).toLocaleString('en-IN')}
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Based on your {sharePercentage}% share (after expenses)
              </span>
            </div>

            {/* Total Month Earning */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>This Month Earning</span>
                <TrendingUp size={16} color="#10b981" />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#10b981' }}>
                ₹{Math.round(data.monthEarnings).toLocaleString('en-IN')}
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </section>

          {/* Driver Share & Status Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#6366f1" />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agreed Payout Split</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {sharePercentage}% Driver Share
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              ● Active Driver
            </div>
          </div>

          {/* Date-wise Earnings History (Read-Only) */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Daily Earnings History
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {data.logs.length} day{data.logs.length === 1 ? '' : 's'} recorded
              </span>
            </div>

            {data.logs.length === 0 ? (
              <div className="card" style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                borderRadius: '16px'
              }}>
                <Calendar size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '600' }}>No daily earnings recorded yet.</p>
                <p style={{ fontSize: '12px', marginTop: '6px' }}>Your daily logs will appear here once recorded by the admin.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.logs.map(log => {
                  const share = parseFloat(log.driver_share_amount) || 0;
                  const total = parseFloat(log.total_amount) || 0;

                  return (
                    <div
                      key={log.id}
                      className="card"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="var(--text-muted)" />
                            <b style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{log.date}</b>
                          </div>
                          {log.vehicle_number && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'inline-block' }}>
                              🚗 {log.vehicle_number}
                            </span>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Your Earning
                          </span>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                            ₹{Math.round(share).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Small breakdown pill of aggregator splits and expenses */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--border-color)',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <span>Total Collection: <b style={{ color: 'var(--text-primary)' }}>₹{total.toLocaleString('en-IN')}</b></span>
                        {log.amount_ola > 0 && <span>• Ola: ₹{log.amount_ola}</span>}
                        {log.amount_uber > 0 && <span>• Uber: ₹{log.amount_uber}</span>}
                        {log.amount_rapido > 0 && <span>• Rapido: ₹{log.amount_rapido}</span>}
                        {log.amount_private > 0 && <span>• Private: ₹{log.amount_private}</span>}
                        {log.expense > 0 && <span style={{ color: 'var(--danger)' }}>• Expense: -₹{log.expense}</span>}
                        {log.expense > 0 && <span style={{ color: '#3b82f6' }}>• Net: ₹{Math.max(0, total - log.expense)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {onNavigateToAbout && (
            <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '16px' }}>
              <button
                onClick={onNavigateToAbout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Globe size={15} />
                <span>Visit AC Fleet About Us & Company Info</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DriverDashboard;
