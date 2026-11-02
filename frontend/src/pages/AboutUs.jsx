import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Users, 
  Car, 
  Wrench, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Zap, 
  Sparkles, 
  Eye, 
  Compass, 
  HeartHandshake, 
  Fuel, 
  FileText, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ExternalLink, 
  MessageSquare, 
  Send,
  LogIn,
  Layers,
  ChevronDown,
  PhoneCall
} from 'lucide-react';
import acLogo from '../assets/logo.png';
import { submitDriverApplication } from '../firebase/services';

const AboutUs = ({ onNavigateToLogin, toggleTheme, darkMode, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeValueTab, setActiveValueTab] = useState(0);
  
  // Application form state
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    city: 'Mumbai',
    experience_years: '2-5 years',
    vehicle_preference: 'Maruti Suzuki Dzire (CNG)',
    preferred_platform: 'Uber & Ola',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Core Values Data (IMPACTT framework tailored for AC Fleet)
  const coreValues = [
    {
      id: 'innovation',
      num: '01',
      title: 'Innovation',
      tagline: 'Challenging outdated fleet models with smart technology.',
      description: 'We believe modern mobility requires modern tools. From cloud-based earnings ledgers and digital expense logs to smart vehicle tracking, we experiment boldly to maximize vehicle uptime and partner income.',
      highlights: [
        'Real-time digital earnings accounting with transparent daily ledgers',
        'Smart preventive maintenance schedules to eliminate unexpected breakdowns',
        'Continuous optimization of driver routes, platform incentives, and fuel efficiency'
      ],
      icon: Zap,
      color: '#0284c7'
    },
    {
      id: 'empower',
      num: '02',
      title: 'eMpower',
      tagline: 'Treating drivers as respected entrepreneurs, not just workers.',
      description: 'Our drivers are the heart and soul of AC Fleet. We equip every partner with transparent net profit-sharing, well-maintained CNG vehicles, and clear pathways towards financial stability and car ownership.',
      highlights: [
        'Guaranteed daily profit splits calculated after legitimate operating expenses',
        'Dignified driver onboarding with dedicated 24/7 emergency roadside support',
        'Drive-to-Own programs helping disciplined drivers become vehicle owners'
      ],
      icon: Users,
      color: '#10b981'
    },
    {
      id: 'passion',
      num: '03',
      title: 'Passion',
      tagline: 'Bringing relentless energy and pride to Mumbai mobility.',
      description: 'We take pride in every kilometer driven. Every clean car, smiling passenger, and successful shift reflects our dedication to setting new benchmarks in urban passenger transport.',
      highlights: [
        'Meticulously detailed and cleaned vehicles that passengers love riding in',
        'Zero-compromise philosophy on driver safety and mechanical fitness',
        'Energetic operations team dedicated to answering calls round-the-clock'
      ],
      icon: Sparkles,
      color: '#f59e0b'
    },
    {
      id: 'agility',
      num: '04',
      title: 'Agility',
      tagline: 'Moving fast, keeping things simple, and acting decisively.',
      description: 'In a dynamic city like Mumbai, speed is essential. We streamline driver onboarding with zero red tape, ensure lightning-fast garage servicing turnarounds, and adapt swiftly to aggregator platform updates.',
      highlights: [
        'Same-day vehicle deployment upon document verification',
        'Rapid in-house garage repairs to keep drivers on the road earning',
        'Dynamic deployment across peak hours, airport runs, and corporate shifts'
      ],
      icon: TrendingUp,
      color: '#6366f1'
    },
    {
      id: 'customer_first',
      num: '05',
      title: 'Customer & Driver First',
      tagline: 'Measuring our success strictly through our partners\' success.',
      description: 'We operate with dual empathy: prioritizing passenger safety and comfort while safeguarding the livelihood, health, and dignity of the driver sitting behind the wheel.',
      highlights: [
        'Driver welfare programs and fair settlement guarantees',
        'Consistently high ratings across Uber, Ola, and private booking channels',
        'Active listening mechanisms to address driver road feedback immediately'
      ],
      icon: HeartHandshake,
      color: '#ec4899'
    },
    {
      id: 'transparency',
      num: '06',
      title: 'Radical Transparency',
      tagline: 'Honest numbers, open books, and zero hidden deductions.',
      description: 'Trust is our currency. We maintain completely transparent accounting: every single rupee of gross revenue, platform commission, fuel, and repair cost is recorded digitally and shared openly.',
      highlights: [
        'Driver payment formula: strictly (Gross Fare - Documented Expenses) × Share %',
        'Instant digital receipts for all vehicle maintenance and fuel logs',
        'No surprise fees, no hidden penalties, and accurate daily payout reconciliations'
      ],
      icon: Eye,
      color: '#06b6d4'
    },
    {
      id: 'team_spirit',
      num: '07',
      title: 'Team Spirit',
      tagline: 'One united fleet family moving forward together.',
      description: 'No one drives alone at AC Fleet. Mechanics, operations managers, and drivers collaborate closely with mutual respect, building a community where everyone thrives together.',
      highlights: [
        'Inclusive, respectful culture celebrating every driver partner\'s milestone',
        'Peer support network and experienced mentors for new drivers',
        'Shared celebrations and festive recognition for top-performing partners'
      ],
      icon: Award,
      color: '#8b5cf6'
    }
  ];

  // Milestones Timeline Data
  const milestones = [
    {
      year: '2024',
      month: 'Jan',
      title: 'The Foundation of AC Fleet',
      description: 'Atharva Chitnis founded AC Fleet in Mumbai with a clear mission: bringing corporate-grade discipline, transparency, and top-tier maintenance to urban shared mobility.'
    },
    {
      year: '2024',
      month: 'Jun',
      title: 'Strategic Aggregator Integration',
      description: 'Onboarded high-efficiency CNG sedans into leading ride-hailing networks (Uber India and Ola Cabs), introducing structured daily driver support shifts.'
    },
    {
      year: '2025',
      month: 'Feb',
      title: '24/7 Dedicated Service Bay',
      description: 'Established an in-house preventive maintenance facility in Mumbai, achieving near-zero mechanical downtime and guaranteed roadside emergency assistance.'
    },
    {
      year: '2025',
      month: 'Aug',
      title: 'Digital Fleet Portal & Real-Time Ledgers',
      description: 'Launched the cloud-connected AC Fleet Portal, giving fleet owners and drivers complete visibility into daily gross fares, fuel expenses, and automated net payouts.'
    },
    {
      year: '2026',
      month: 'Current',
      title: 'Multi-Vertical Mobility & Fleet Expansion',
      description: 'Expanded operations into corporate chauffeur rentals, airport transit, intercity travel, and laying the strategic roadmap for green Electric Vehicle (EV) fleet deployment.'
    }
  ];

  // Offerings Data
  const services = [
    {
      title: 'Ride-Hailing Fleet Operations',
      subtitle: 'Ola • Uber • Rapido Network Support',
      description: 'High-utilization commercial sedans equipped with CNG kits, verified commercial permits, and comprehensive insurance for maximized driver earnings.',
      icon: Car,
      tags: ['Uber Partner', 'Ola Premier', 'Rapido Cabs']
    },
    {
      title: 'Car Rentals & Private Mobility',
      subtitle: 'Corporate Travel & Airport Transfers',
      description: 'Clean, comfortable, and executive-ready vehicles for airport pick-up/drop-offs, outstation weekend journeys, and long-term corporate mobility contracts.',
      icon: Compass,
      tags: ['Airport Chauffeur', 'Intercity Trips', 'Corporate Fleet']
    },
    {
      title: 'Driver-Partner Enablement',
      subtitle: 'Drive-to-Earn & Own-Now Pathways',
      description: 'Flexible daily rental and profit-sharing models designed to give dedicated drivers sustainable incomes and future opportunities to own their vehicle.',
      icon: HeartHandshake,
      tags: ['Transparent Payouts', 'Zero Hidden Fees', 'Drive To Own']
    },
    {
      title: 'Complete Preventive Fleet Care',
      subtitle: 'In-House Garage & 24/7 Breakdown Recovery',
      description: 'Full vehicle lifecycle management: routine oil changes, brake pads, tyre replacement, fitness certificates, and 24/7 emergency towing assistance.',
      icon: Wrench,
      tags: ['100% Inspected', '24/7 Roadside Aid', 'Zero Downtime']
    }
  ];

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.mobile_number) return;
    setSubmitting(true);
    try {
      await submitDriverApplication(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div style={{
      backgroundColor: darkMode ? '#070b14' : '#f8fafc',
      color: darkMode ? '#f1f5f9' : '#0f172a',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      lineHeight: '1.6',
      overflowX: 'hidden'
    }}>
      {/* 1. TOP ANNOUNCEMENT / QUICK INFO BAR */}
      <div style={{
        backgroundColor: darkMode ? '#0b1329' : '#0f172a',
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: '500',
        padding: '8px 24px',
        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00e5ff',
            boxShadow: '0 0 10px #00e5ff'
          }} />
          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>AC Fleet</span>
          <span>• Fleet • Rental • Mobility | Serving Mumbai & Maharashtra</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <a 
            href="tel:+918104517652" 
            style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={13} />
            <span>+91 81045 17652</span>
          </a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: 0,
              fontSize: '12px'
            }}
          >
            <LogIn size={13} />
            <span>{currentUser ? 'Go to Dashboard →' : 'Fleet Portal Login →'}</span>
          </button>
        </div>
      </div>

      {/* 2. STICKY MAIN NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: darkMode ? 'rgba(11, 19, 43, 0.92)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.9)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img 
              src={acLogo} 
              alt="AC Fleet" 
              style={{
                height: '46px',
                width: 'auto',
                objectFit: 'contain',
                filter: darkMode ? 'drop-shadow(0 2px 8px rgba(0, 229, 255, 0.25))' : 'none'
              }} 
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{
            display: 'none',
            alignItems: 'center',
            gap: '28px',
            fontSize: '14px',
            fontWeight: '600'
          }} className="desktop-nav">
            <button 
              onClick={() => scrollToSection('values')}
              style={{ background: 'none', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#0284c7'}
              onMouseLeave={(e) => e.target.style.color = darkMode ? '#cbd5e1' : '#475569'}
            >
              Our Values
            </button>
            <button 
              onClick={() => scrollToSection('milestones')}
              style={{ background: 'none', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#0284c7'}
              onMouseLeave={(e) => e.target.style.color = darkMode ? '#cbd5e1' : '#475569'}
            >
              Our Journey
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              style={{ background: 'none', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#0284c7'}
              onMouseLeave={(e) => e.target.style.color = darkMode ? '#cbd5e1' : '#475569'}
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('founder')}
              style={{ background: 'none', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#0284c7'}
              onMouseLeave={(e) => e.target.style.color = darkMode ? '#cbd5e1' : '#475569'}
            >
              Founder's Message
            </button>
            <button 
              onClick={() => scrollToSection('apply')}
              style={{ background: 'none', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#0284c7'}
              onMouseLeave={(e) => e.target.style.color = darkMode ? '#cbd5e1' : '#475569'}
            >
              Drive With Us
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                color: darkMode ? '#facc15' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Portal Login Button */}
            <button
              onClick={onNavigateToLogin}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                backgroundColor: darkMode ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                color: darkMode ? '#38bdf8' : '#0284c7',
                border: darkMode ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #bae6fd',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={15} />
              <span>{currentUser ? 'Dashboard' : 'Portal Login'}</span>
            </button>

            {/* Apply / Drive CTA */}
            <button
              onClick={() => scrollToSection('apply')}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0369a1'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0284c7'}
            >
              <span>Drive With Us</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'none',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div style={{
            padding: '20px 24px',
            backgroundColor: darkMode ? '#0b1329' : '#ffffff',
            borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <button onClick={() => scrollToSection('values')} style={{ textAlign: 'left', background: 'none', border: 'none', color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '15px', fontWeight: '600', padding: '8px 0' }}>Our Values</button>
            <button onClick={() => scrollToSection('milestones')} style={{ textAlign: 'left', background: 'none', border: 'none', color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '15px', fontWeight: '600', padding: '8px 0' }}>Our Journey</button>
            <button onClick={() => scrollToSection('services')} style={{ textAlign: 'left', background: 'none', border: 'none', color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '15px', fontWeight: '600', padding: '8px 0' }}>Services & Offerings</button>
            <button onClick={() => scrollToSection('founder')} style={{ textAlign: 'left', background: 'none', border: 'none', color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '15px', fontWeight: '600', padding: '8px 0' }}>Meet Our Founder</button>
            <button onClick={() => scrollToSection('apply')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#0284c7', fontSize: '15px', fontWeight: '700', padding: '8px 0' }}>Start Driving Today →</button>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (Mirroring Everest Fleet's Core Heading & Grand Presence) */}
      <section style={{
        position: 'relative',
        padding: '90px 24px 80px',
        background: darkMode 
          ? 'radial-gradient(ellipse at 50% 20%, #0f274a 0%, #070c18 70%)' 
          : 'radial-gradient(ellipse at 50% 20%, #e0f2fe 0%, #f8fafc 75%)',
        textAlign: 'center',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        {/* Glow backdrop decorative rings */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '350px',
          background: 'rgba(2, 132, 199, 0.12)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Tagline Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: darkMode ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
            border: darkMode ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
            color: darkMode ? '#38bdf8' : '#0284c7',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '24px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} />
            <span>AC Fleet • Fleet • Rental • Mobility</span>
          </div>

          {/* Everest-Style Hero Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            marginBottom: '24px',
            color: darkMode ? '#ffffff' : '#0f172a'
          }}>
            Your Journey.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #0284c7 60%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Our Support.
            </span>
            <br />
            Together, We Move Forward.
          </h1>

          {/* Subtitle Description */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: darkMode ? '#94a3b8' : '#475569',
            maxWidth: '780px',
            margin: '0 auto 36px',
            fontWeight: '400',
            lineHeight: '1.7'
          }}>
            Mumbai's premier shared-mobility and fleet management enterprise. We empower professional drivers with top-condition vehicles, 100% transparent daily profit sharing, and dedicated 24/7 maintenance support across Ola, Uber, Rapido, and corporate rentals.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '60px'
          }}>
            <button
              onClick={() => scrollToSection('apply')}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span>Apply to Drive Today</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => scrollToSection('values')}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : '#ffffff',
                color: darkMode ? '#e2e8f0' : '#1e293b',
                border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#0284c7'}
              onMouseLeave={(e) => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}
            >
              <span>Explore Our Foundation</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Stat Cards Grid (Everest Fleet Impact Bar) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            maxWidth: '1080px',
            margin: '0 auto'
          }}>
            <div style={{
              padding: '24px 20px',
              borderRadius: '16px',
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0284c7', marginBottom: '4px' }}>100%</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#f1f5f9' : '#0f172a' }}>Verified & Compliant</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Fitness, PUC & Commercial Insurance</div>
            </div>

            <div style={{
              padding: '24px 20px',
              borderRadius: '16px',
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', marginBottom: '4px' }}>24 / 7</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#f1f5f9' : '#0f172a' }}>Maintenance & Support</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>In-house garage & roadside assistance</div>
            </div>

            <div style={{
              padding: '24px 20px',
              borderRadius: '16px',
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b', marginBottom: '4px' }}>0 ₹</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#f1f5f9' : '#0f172a' }}>Hidden Deductions</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Absolute accounting transparency</div>
            </div>

            <div style={{
              padding: '24px 20px',
              borderRadius: '16px',
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#8b5cf6', marginBottom: '4px' }}>Multi</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#f1f5f9' : '#0f172a' }}>Mobility Channels</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Uber, Ola, Rapido & Private Rentals</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "OUR VALUES — OUR FOUNDATION" (Tailored IMPACTT Framework) */}
      <section id="values" style={{
        padding: '100px 24px',
        backgroundColor: darkMode ? '#070b14' : '#ffffff',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#0284c7',
              display: 'block',
              marginBottom: '10px'
            }}>
              Our Core Values
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: '900',
              letterSpacing: '-1px',
              color: darkMode ? '#ffffff' : '#0f172a',
              marginBottom: '16px'
            }}>
              Our Values — Our Foundation.
            </h2>
            <p style={{
              fontSize: '17px',
              color: darkMode ? '#94a3b8' : '#64748b',
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              Seven principles that spell our standard of excellence: guiding how we work, empowering our drivers, and ensuring dependable urban mobility.
            </p>
          </div>

          {/* Interactive Values Selector & Detailed Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            alignItems: 'start'
          }}>
            {/* Left: Value Pills List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {coreValues.map((val, idx) => {
                const IconComponent = val.icon;
                const isSelected = activeValueTab === idx;
                return (
                  <div
                    key={val.id}
                    onClick={() => setActiveValueTab(idx)}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected 
                        ? (darkMode ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe')
                        : (darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
                      border: isSelected 
                        ? '2px solid #0284c7' 
                        : (darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'),
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '800',
                        color: isSelected ? '#0284c7' : (darkMode ? '#64748b' : '#94a3b8'),
                        width: '24px'
                      }}>
                        {val.num}
                      </span>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#0284c7' : (darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0'),
                        color: isSelected ? '#ffffff' : (darkMode ? '#cbd5e1' : '#475569'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={18} />
                      </div>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: isSelected ? (darkMode ? '#ffffff' : '#0f172a') : (darkMode ? '#cbd5e1' : '#334155')
                      }}>
                        {val.title}
                      </span>
                    </div>

                    <ChevronRight 
                      size={18} 
                      color={isSelected ? '#0284c7' : (darkMode ? '#475569' : '#94a3b8')} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Right: Active Value Spotlight Card */}
            <div style={{
              padding: '36px',
              borderRadius: '24px',
              backgroundColor: darkMode ? '#0b1329' : '#ffffff',
              border: darkMode ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid #cbd5e1',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #00e5ff, #0284c7)'
              }} />

              {/* Number and Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{
                  fontSize: '44px',
                  fontWeight: '900',
                  color: 'rgba(2, 132, 199, 0.25)',
                  lineHeight: '1'
                }}>
                  {coreValues[activeValueTab].num}
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: darkMode ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Core Pillar
                </span>
              </div>

              <h3 style={{
                fontSize: '28px',
                fontWeight: '900',
                color: darkMode ? '#ffffff' : '#0f172a',
                marginBottom: '8px'
              }}>
                {coreValues[activeValueTab].title}
              </h3>

              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0284c7',
                marginBottom: '18px'
              }}>
                {coreValues[activeValueTab].tagline}
              </p>

              <p style={{
                fontSize: '15px',
                color: darkMode ? '#94a3b8' : '#475569',
                lineHeight: '1.7',
                marginBottom: '28px'
              }}>
                {coreValues[activeValueTab].description}
              </p>

              {/* Highlights checklist */}
              <div style={{
                borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: darkMode ? '#cbd5e1' : '#64748b' }}>
                  Key Commitments
                </div>
                {coreValues[activeValueTab].highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '14px', color: darkMode ? '#e2e8f0' : '#334155', fontWeight: '500' }}>
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "OUR JOURNEY SO FAR" (Everest Fleet Milestones Timeline) */}
      <section id="milestones" style={{
        padding: '100px 24px',
        backgroundColor: darkMode ? '#0b1329' : '#f8fafc',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#0284c7',
              display: 'block',
              marginBottom: '10px'
            }}>
              Our Milestones
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: '900',
              letterSpacing: '-1px',
              color: darkMode ? '#ffffff' : '#0f172a',
              marginBottom: '16px'
            }}>
              Our Journey So Far.
            </h2>
            <p style={{
              fontSize: '17px',
              color: darkMode ? '#94a3b8' : '#64748b',
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              From ambitious beginnings to an integrated fleet operating seamlessly across Mumbai’s bustling transit networks.
            </p>
          </div>

          {/* Timeline Structure */}
          <div style={{ position: 'relative', paddingLeft: '30px' }}>
            {/* Vertical connector line */}
            <div style={{
              position: 'absolute',
              top: '15px',
              bottom: '15px',
              left: '11px',
              width: '3px',
              background: 'linear-gradient(180deg, #0284c7 0%, #10b981 100%)',
              borderRadius: '2px'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Glowing Node Dot */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '-26px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '4px solid #0284c7',
                    boxShadow: '0 0 10px rgba(2, 132, 199, 0.5)'
                  }} />

                  {/* Milestone Card */}
                  <div style={{
                    padding: '24px 28px',
                    borderRadius: '16px',
                    backgroundColor: darkMode ? '#070b14' : '#ffffff',
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800'
                      }}>
                        {m.year}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#10b981',
                        textTransform: 'uppercase'
                      }}>
                        {m.month}
                      </span>
                    </div>

                    <h4 style={{
                      fontSize: '19px',
                      fontWeight: '800',
                      color: darkMode ? '#ffffff' : '#0f172a',
                      marginBottom: '8px'
                    }}>
                      {m.title}
                    </h4>

                    <p style={{
                      fontSize: '14.5px',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT WE DO (Services & Offerings) */}
      <section id="services" style={{
        padding: '100px 24px',
        backgroundColor: darkMode ? '#070b14' : '#ffffff',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#0284c7',
              display: 'block',
              marginBottom: '10px'
            }}>
              Comprehensive Solutions
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: '900',
              letterSpacing: '-1px',
              color: darkMode ? '#ffffff' : '#0f172a',
              marginBottom: '16px'
            }}>
              What We Do — Fleet & Mobility Services.
            </h2>
            <p style={{
              fontSize: '17px',
              color: darkMode ? '#94a3b8' : '#64748b',
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              Empowering aggregators, corporate riders, and individual drivers with end-to-end vehicle solutions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px'
          }}>
            {services.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div key={idx} style={{
                  padding: '32px 26px',
                  borderRadius: '20px',
                  backgroundColor: darkMode ? '#0b1329' : '#f8fafc',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}>
                  <div>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: darkMode ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px'
                    }}>
                      <IconComp size={26} />
                    </div>

                    <h3 style={{
                      fontSize: '19px',
                      fontWeight: '800',
                      color: darkMode ? '#ffffff' : '#0f172a',
                      marginBottom: '6px'
                    }}>
                      {srv.title}
                    </h3>

                    <p style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#0284c7',
                      marginBottom: '14px'
                    }}>
                      {srv.subtitle}
                    </p>

                    <p style={{
                      fontSize: '14px',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      lineHeight: '1.6',
                      marginBottom: '22px'
                    }}>
                      {srv.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {srv.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
                        color: darkMode ? '#cbd5e1' : '#475569',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. MEET OUR FOUNDER (Mirroring Everest Fleet Siddharth Ladsariya Spotlight) */}
      <section id="founder" style={{
        padding: '100px 24px',
        backgroundColor: darkMode ? '#0b1329' : '#f8fafc',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            padding: '48px',
            borderRadius: '28px',
            backgroundColor: darkMode ? '#070b14' : '#ffffff',
            border: darkMode ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid #cbd5e1',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#0284c7',
              display: 'block',
              marginBottom: '10px'
            }}>
              Leadership Perspective
            </span>

            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: '900',
              color: darkMode ? '#ffffff' : '#0f172a',
              marginBottom: '24px'
            }}>
              Meet Our Founder.
            </h2>

            {/* Founder Quote Card */}
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: darkMode ? 'rgba(2, 132, 199, 0.1)' : '#f0f9ff',
              borderLeft: '5px solid #0284c7',
              marginBottom: '32px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: '700',
                color: darkMode ? '#e0f2fe' : '#0369a1',
                lineHeight: '1.5',
                margin: 0,
                fontStyle: 'italic'
              }}>
                “Our journey has always been about more than cars — it has always been about people.”
              </p>
            </div>

            {/* Founder Letter Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontSize: '15.5px',
              color: darkMode ? '#cbd5e1' : '#334155',
              lineHeight: '1.8',
              marginBottom: '36px'
            }}>
              <p>
                When we launched <strong>AC Fleet</strong>, we set out to address a fundamental gap in India's shared-mobility landscape: giving hardworking drivers a reliable, clean vehicle and a dignified, honest way to earn and build a better future for their families.
              </p>
              <p>
                Over the years, AC Fleet has grown in fleet strength, running hours, and community reputation. But what has remained unshakeable is our core conviction: <strong>every driver deserves respect, absolute transparency in their earnings, and a fleet partner they can rely on 24 hours a day.</strong>
              </p>
              <p>
                I have seen drivers start their journey with us with a simple goal — to earn consistently and provide for their children. Watching them build savings, take pride in their craft, and move steadily toward car ownership is what makes AC Fleet what it is today.
              </p>
              <p>
                We still have a long way to travel. And I hope we continue to grow together, one successful trip at a time. Thank you for placing your trust in AC Fleet.
              </p>
            </div>

            {/* Founder Signature Area */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              paddingTop: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>
                  Atharva Chitnis
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0284c7' }}>
                  Founder & Managing Director, AC Fleet
                </div>
                <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  Fleet • Rental • Mobility | Mumbai, India
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href="tel:+918104517652"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    color: darkMode ? '#38bdf8' : '#0284c7',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} />
                  <span>Call Office</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. "START DRIVING TODAY" (Everest Fleet Interactive Application Form) */}
      <section id="apply" style={{
        padding: '100px 24px',
        backgroundColor: darkMode ? '#070b14' : '#ffffff',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#0284c7',
              display: 'block',
              marginBottom: '10px'
            }}>
              Join the Fleet
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: '900',
              letterSpacing: '-1px',
              color: darkMode ? '#ffffff' : '#0f172a',
              marginBottom: '16px'
            }}>
              Start Driving Today.
            </h2>
            <p style={{
              fontSize: '16px',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              Get behind the wheel of a top-condition vehicle with guaranteed daily support and transparent net payouts.
            </p>
          </div>

          <div style={{
            padding: '36px',
            borderRadius: '24px',
            backgroundColor: darkMode ? '#0b1329' : '#f8fafc',
            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
            boxShadow: '0 15px 35px -5px rgba(0,0,0,0.05)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#ffffff' : '#0f172a', marginBottom: '10px' }}>
                  Application Received!
                </h3>
                <p style={{ fontSize: '15px', color: darkMode ? '#94a3b8' : '#64748b', maxWidth: '480px', margin: '0 auto 28px' }}>
                  Thank you, <strong>{formData.full_name}</strong>. Our fleet management team has received your details and will call you at <strong>{formData.mobile_number}</strong> shortly.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/918104517652?text=Hello%20AC%20Fleet%2C%20I%20have%20submitted%20my%20driver%20application.%20Name%3A%20${encodeURIComponent(formData.full_name)}%2C%20Phone%3A%20${encodeURIComponent(formData.mobile_number)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '10px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={16} />
                    <span>Chat on WhatsApp Directly</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        full_name: '',
                        mobile_number: '',
                        city: 'Mumbai',
                        experience_years: '2-5 years',
                        vehicle_preference: 'Maruti Suzuki Dzire (CNG)',
                        preferred_platform: 'Uber & Ola',
                        notes: ''
                      });
                    }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
                      color: darkMode ? '#e2e8f0' : '#475569',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      Mobile Number (WhatsApp Enabled) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      City / Area *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Thane">Thane</option>
                      <option value="Navi Mumbai">Navi Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Other Maharashtra">Other Maharashtra</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      Driving Experience
                    </label>
                    <select
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="1-2 years">1 - 2 Years</option>
                      <option value="2-5 years">2 - 5 Years</option>
                      <option value="5+ years">5+ Years (Experienced)</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      Preferred Vehicle Type
                    </label>
                    <select
                      value={formData.vehicle_preference}
                      onChange={(e) => setFormData({ ...formData, vehicle_preference: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Maruti Suzuki Dzire (CNG)">Maruti Suzuki Dzire (CNG)</option>
                      <option value="Hyundai Aura (CNG)">Hyundai Aura (CNG)</option>
                      <option value="Maruti Suzuki Ertiga (CNG)">Maruti Suzuki Ertiga (7-Seater CNG)</option>
                      <option value="Tata Tigor (CNG)">Tata Tigor (CNG)</option>
                      <option value="Toyota Etios / Dzire (Diesel)">Toyota Etios / Diesel</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: darkMode ? '#cbd5e1' : '#334155' }}>
                      Preferred Driving Service
                    </label>
                    <select
                      value={formData.preferred_platform}
                      onChange={(e) => setFormData({ ...formData, preferred_platform: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        backgroundColor: darkMode ? '#070b14' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Uber & Ola">Uber & Ola Ride-Hailing</option>
                      <option value="Private & Airport Rentals">Private Chauffeur & Airport</option>
                      <option value="Corporate Commute">Corporate Employee Commute</option>
                      <option value="Drive to Own">Drive To Own Program</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '12px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '800',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    <span>{submitting ? 'Submitting Application...' : 'Submit & Apply Now'}</span>
                    <Send size={16} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b' }}>Or call directly:</span>
                    <a
                      href="tel:+918104517652"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                        color: darkMode ? '#38bdf8' : '#0284c7',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>+91 81045 17652</span>
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. COMPREHENSIVE FOOTER (Everest Fleet Inspired) */}
      <footer style={{
        backgroundColor: darkMode ? '#05080f' : '#0f172a',
        color: '#94a3b8',
        padding: '80px 24px 30px',
        borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : 'none'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Col 1: Brand Info */}
          <div>
            <img 
              src={acLogo} 
              alt="AC Fleet" 
              style={{
                height: '46px',
                width: 'auto',
                objectFit: 'contain',
                marginBottom: '16px',
                filter: 'drop-shadow(0 2px 8px rgba(0, 229, 255, 0.3))'
              }} 
            />
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>
              AC Fleet is Mumbai's premier fleet management and mobility enterprise. Empowering drivers, powering aggregators, and delivering unmatched passenger comfort.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '13px' }}>
              <MapPin size={16} color="#38bdf8" />
              <span>Dadar West, Mumbai, Maharashtra 400028</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff', marginBottom: '18px' }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>About Us</button>
              <button onClick={() => scrollToSection('values')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Our Core Values</button>
              <button onClick={() => scrollToSection('milestones')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Our Journey</button>
              <button onClick={() => scrollToSection('founder')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Founder's Perspective</button>
            </div>
          </div>

          {/* Col 3: For Drivers */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff', marginBottom: '18px' }}>
              Drivers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <button onClick={() => scrollToSection('apply')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#38bdf8', fontWeight: '600', cursor: 'pointer', padding: 0 }}>Start Driving Today</button>
              <button onClick={() => scrollToSection('services')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Drive To Earn Model</button>
              <button onClick={() => scrollToSection('values')} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Transparent Payouts</button>
              <button onClick={onNavigateToLogin} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Driver Daily Ledger</button>
            </div>
          </div>

          {/* Col 4: Contact & Portal */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff', marginBottom: '18px' }}>
              Operations & Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="tel:+918104517652" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#38bdf8" />
                <span>+91 81045 17652</span>
              </a>
              <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="#10b981" />
                <span>24/7 Operations Hub</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={onNavigateToLogin}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogIn size={14} />
                  <span>{currentUser ? 'Open Fleet Dashboard' : 'Fleet Portal Sign In'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div>
            © 2026 AC Fleet (Atharva Enterprises). All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Fleet • Rental • Mobility</span>
            <span>|</span>
            <span>Mumbai, Maharashtra</span>
          </div>
        </div>
      </footer>

      {/* Global Responsive Styles */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
