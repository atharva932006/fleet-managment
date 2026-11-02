import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import OwnerDashboard from './pages/OwnerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AboutUs from './pages/AboutUs';
import acLogo from './assets/logo.png';
import { ArrowLeft, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import './styles/main.css';

// Login Component
const Login = ({ onBackToAbout }) => {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobile, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ position: 'relative' }}>
      {/* Back to public website button */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 10
      }}>
        <button
          onClick={onBackToAbout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #cbd5e1',
            color: '#0284c7',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0284c7';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.color = '#0284c7';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to AC Fleet Website</span>
        </button>
      </div>

      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src={acLogo}
            alt="AC Fleet - Fleet Rental Mobility"
            style={{ maxWidth: '260px', width: '100%', height: 'auto', display: 'inline-block' }}
          />
        </div>
        <p className="login-subtitle" style={{ marginTop: '0', marginBottom: '24px' }}>Fleet Management Portal</p>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'left',
            borderLeft: '4px solid #ef4444'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 8104517652"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Secure Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Looking for driver partnerships or vehicle rentals?
          </p>
          <button
            onClick={onBackToAbout}
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
            <span>Explore AC Fleet About Us & Services</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Routing Container
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Current View: 'about' (public website), 'login' (auth portal), 'dashboard' (app)
  const [view, setView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash === '#login' || path === '/login') return 'login';
    if (hash === '#dashboard' || path === '/dashboard') return 'dashboard';
    return 'about';
  });

  // Listen to hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') setView('login');
      else if (hash === '#dashboard' && user) setView('dashboard');
      else if (hash === '#about' || hash === '') setView('about');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user]);

  // Handle Theme switching
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: darkMode ? '#0b0f19' : '#f8fafc',
        color: darkMode ? '#f9fafb' : '#0f172a',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(2, 132, 199, 0.1)',
          borderTopColor: '#0284c7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', fontWeight: '600', fontSize: '15px' }}>Loading AC Fleet Portal...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 1. If user is viewing the public About Us page
  if (view === 'about') {
    return (
      <AboutUs 
        onNavigateToLogin={() => {
          if (user) {
            setView('dashboard');
            window.location.hash = '#dashboard';
          } else {
            setView('login');
            window.location.hash = '#login';
          }
        }}
        toggleTheme={toggleTheme}
        darkMode={darkMode}
        currentUser={user}
      />
    );
  }

  // 2. If user is viewing Login screen
  if (!user || view === 'login') {
    return (
      <Login 
        onBackToAbout={() => {
          setView('about');
          window.location.hash = '#about';
        }} 
      />
    );
  }

  // 3. User is authenticated and viewing Dashboard
  return user.role === 'owner' ? (
    <OwnerDashboard 
      toggleTheme={toggleTheme} 
      darkMode={darkMode} 
      onNavigateToAbout={() => {
        setView('about');
        window.location.hash = '#about';
      }} 
    />
  ) : (
    <DriverDashboard 
      toggleTheme={toggleTheme} 
      darkMode={darkMode} 
      onNavigateToAbout={() => {
        setView('about');
        window.location.hash = '#about';
      }} 
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
