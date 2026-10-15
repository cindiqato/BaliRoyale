
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// BALIROYALE COLORS
const C = {
  cream: '#F4F1EA',
  green: '#3A4D39',
  medium: '#4F6F52',
  pink: '#F2DCD5',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
  border: '#C4BBAF',
};

// REUSABLE INLINE STYLES
const s = {
  page: {
    minHeight: '100vh',
    background: C.cream,
    padding: '45px 30px',
    fontFamily: 'Arial, sans-serif',
    color: '#333333',
    boxSizing: 'border-box',
  },
  container: { maxWidth: 1100, margin: '0 auto' },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
  },
  title: {
    color: C.green,
    fontSize: 32,
    margin: '12px 0 8px',
  },
  muted: {
    color: C.gray,
    fontSize: 13,
    margin: 0,
  },
  sectionTitle: {
    color: C.green,
    fontSize: 20,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 18,
  },
  card: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 24,
    minHeight: 130,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 18,
    boxShadow: '0 4px 14px rgba(58,77,57,0.04)',
    boxSizing: 'border-box',
  },
  panel: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 5px 25px rgba(58,77,57,0.06)',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    background: C.cream,
    color: C.green,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 20,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setStats(res.data))
      .catch(err =>
        setError(
          err.response?.data?.error ||
          'Failed to load dashboard'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // STATISTICS DATA
  const statistics = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '♙' },
    { label: 'Guests', value: stats.totalGuests, icon: '♙' },
    { label: 'Staff', value: stats.totalStaff, icon: '♙' },
    { label: 'Packages', value: stats.totalPackages, icon: '▣' },
    { label: 'Bookings', value: stats.totalBookings, icon: '▦' },
    { label: 'Archived Records', value: stats.totalArchived, icon: '▤' },
  ] : [];

  // MANAGEMENT LINKS
  const actions = [
    { label: 'Manage Users', path: '/admin/users' },
    { label: 'Manage Packages', path: '/admin/packages' },
    { label: 'Archives', path: '/admin/archives' },
    { label: 'Audit Logs', path: '/admin/auditlogs' },
  ];

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* WELCOME HEADER */}
        <div style={{ ...s.row, marginBottom: 38 }}>
          <div>
            <span style={{
              color: C.gray,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
            }}>
              BALIROYALE / ADMINISTRATION
            </span>

            <h1 style={s.title}>
              Welcome, {user?.firstName}!
            </h1>

            <p style={{ ...s.muted, fontSize: 14 }}>
              Admin overview of the system.
            </p>
          </div>

          <div style={{
            width: 65,
            height: 65,
            background: C.green,
            color: C.white,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
        </div>

        {/* LOADING AND ERROR */}
        {loading && (
          <p style={{ ...s.muted, textAlign: 'center', padding: 25 }}>
            Loading...
          </p>
        )}

        {error && (
          <p style={{
            background: C.pink,
            color: '#A13E3E',
            padding: 14,
            borderRadius: 8,
            marginBottom: 20,
          }}>
            {error}
          </p>
        )}

        {/* SYSTEM OVERVIEW */}
        {stats && (
          <section style={{ marginBottom: 35 }}>

            <div style={{ ...s.row, marginBottom: 18 }}>
              <h2 style={s.sectionTitle}>
                System Overview
              </h2>
              <span style={s.muted}>
                Overview Statistics
              </span>
            </div>

            <div style={s.grid}>
              {statistics.map(item => (
                <div key={item.label} style={s.card}>

                  <div style={s.row}>
                    <span style={{
                      color: C.brown,
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {item.label}
                    </span>

                    <span style={{
                      color: C.medium,
                      fontSize: 22,
                    }}>
                      {item.icon}
                    </span>
                  </div>

                  <strong style={{
                    color: C.green,
                    fontSize: 36,
                    lineHeight: 1,
                  }}>
                    {item.value}
                  </strong>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* QUICK MANAGEMENT */}
        <section style={s.panel}>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{
              ...s.sectionTitle,
              marginBottom: 7,
            }}>
              Quick Management
            </h2>

            <p style={s.muted}>
              Access your administrative tools
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}>
            {actions.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...s.action,
                  ...(index === 0 ? {
                    background: C.green,
                    color: C.white,
                    borderColor: C.green,
                  } : {}),
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontSize: 20, fontWeight: 400 }}>
                  ↗
                </span>
              </Link>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
