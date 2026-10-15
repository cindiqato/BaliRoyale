import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Alert, Space } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  gold: '#C5A46D',
  cream: '#F4F1EA',
  white: '#FAFAF8',
  gray: '#6E5A48',
  brown: '#8A7A68',
  border: '#E2DCD5',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statistics = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <TeamOutlined style={{ color: C.green }} /> },
        { label: 'Guests', value: stats.totalGuests, icon: <UserOutlined style={{ color: C.green }} /> },
        { label: 'Staff', value: stats.totalStaff, icon: <IdcardOutlined style={{ color: C.green }} /> },
        { label: 'Packages', value: stats.totalPackages, icon: <AppstoreOutlined style={{ color: C.green }} /> },
        { label: 'Bookings', value: stats.totalBookings, icon: <CalendarOutlined style={{ color: C.green }} /> },
        { label: 'Archived Records', value: stats.totalArchived, icon: <FileTextOutlined style={{ color: C.green }} /> },
      ]
    : [];

  const actions = [
    { label: 'Manage Users', path: '/admin/users' },
    { label: 'Manage Packages', path: '/admin/packages' },
    { label: 'Archives', path: '/admin/archives' },
    { label: 'Audit Logs', path: '/admin/auditlogs' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.cream,
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p
            style={{
              color: C.gold,
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: 4,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Bali Royale / Administration
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2.5rem',
              fontWeight: 600,
              color: C.green,
              margin: '12px 0 8px',
            }}
          >
            Welcome, {user?.firstName}!
          </h1>
          <p style={{ color: C.gray, margin: 0 }}>Admin overview of the system.</p>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24 }} />
        )}

        {loading && (
          <p style={{ textAlign: 'center', color: C.gray, padding: 30 }}>Loading...</p>
        )}

        {stats && (
          <>
            {/* Statistics */}
            <Row gutter={[18, 18]} style={{ marginBottom: 32 }}>
              {statistics.map((item) => (
                <Col xs={24} sm={12} md={8} key={item.label}>
                  <Card
                    bordered={false}
                    style={{
                      background: 'rgba(250, 250, 248, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderRadius: 16,
                      border: `1px solid ${C.border}`,
                      boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: C.brown, fontWeight: 600 }}>
                          {item.label}
                        </span>
                      }
                      value={item.value}
                      prefix={item.icon}
                      valueStyle={{
                        color: C.green,
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Quick actions */}
            <Card
              bordered={false}
              style={{
                background: 'rgba(250, 250, 248, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
              }}
              bodyStyle={{ padding: '28px' }}
            >
              <h2
                style={{
                  fontFamily: 'Georgia, serif',
                  color: C.green,
                  margin: '0 0 8px',
                }}
              >
                Quick Management
              </h2>
              <p style={{ color: C.gray, margin: '0 0 20px' }}>
                Access your administrative tools
              </p>

              <Row gutter={[14, 14]}>
                {actions.map((item, index) => (
                  <Col xs={24} sm={12} key={item.path}>
                    <Link to={item.path}>
                      <div
                        style={{
                          background: index === 0 ? C.green : C.cream,
                          color: index === 0 ? '#FAFAF8' : C.green,
                          border: index === 0 ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: 20,
                          fontSize: 14,
                          fontWeight: 700,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{item.label}</span>
                        <span style={{ fontSize: 20, fontWeight: 400 }}>↗</span>
                      </div>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;