import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Spin, Alert, Row, Col, Statistic, Space } from 'antd';
import { 
  CalendarOutlined, 
  CreditCardOutlined, 
  ExclamationCircleOutlined, 
  SwapOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/staff')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F1EA',
        color: '#333333',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#3A4D39',
              letterSpacing: '0.05em',
              margin: '0 0 8px 0',
            }}
          >
            Welcome, {user?.firstName}!
          </h1>
          <p style={{ color: '#6E5A48', fontSize: '0.95rem', margin: 0 }}>
            Staff overview of active reservations and pending tasks
          </p>
        </div>

        {/* Feedback Alert */}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} closable />
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ color: '#6E5A48', marginTop: 12 }}>Loading dashboard statistics...</p>
          </div>
        )}

        {!loading && stats && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Summary Grid */}
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={8}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: '#8A7A68', fontWeight: 600 }}>Pending Bookings</span>}
                    value={stats.pendingBookings}
                    prefix={<CalendarOutlined style={{ color: '#8A7A68' }} />}
                    valueStyle={{ color: '#3A4D39', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: '#8A7A68', fontWeight: 600 }}>Confirmed Bookings</span>}
                    value={stats.confirmedBookings}
                    prefix={<CheckCircleOutlined style={{ color: '#4F6F52' }} />}
                    valueStyle={{ color: '#4F6F52', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: '#8A7A68', fontWeight: 600 }}>Pending Payments</span>}
                    value={stats.pendingPayments}
                    prefix={<CreditCardOutlined style={{ color: '#8A7A68' }} />}
                    valueStyle={{ color: '#3A4D39', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: '#8A7A68', fontWeight: 600 }}>Cancel Requests</span>}
                    value={stats.pendingCancelRequests}
                    prefix={<ExclamationCircleOutlined style={{ color: '#333333' }} />}
                    valueStyle={{ color: '#333333', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={<span style={{ color: '#8A7A68', fontWeight: 600 }}>Reschedule Requests</span>}
                    value={stats.pendingRescheduleRequests}
                    prefix={<SwapOutlined style={{ color: '#4F6F52' }} />}
                    valueStyle={{ color: '#4F6F52', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Quick Actions Bar */}
            <Card
              bordered={false}
              style={{
                background: 'rgba(250, 250, 248, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid #E2DCD5',
                boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                textAlign: 'center',
              }}
              bodyStyle={{ padding: '28px 20px' }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.25rem',
                  color: '#3A4D39',
                  marginBottom: '20px',
                }}
              >
                Management Shortcuts
              </h3>

              <Space wrap size="middle" style={{ justifyContent: 'center' }}>
                <Link to="/staff/bookings">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    size="large"
                    style={{ background: '#3A4D39', borderColor: '#3A4D39' }}
                  >
                    Manage Bookings
                  </Button>
                </Link>

                <Link to="/staff/payments">
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    size="large"
                    style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                  >
                    Verify Payments
                  </Button>
                </Link>

                <Link to="/staff/requests">
                  <Button
                    size="large"
                    icon={<ArrowRightOutlined />}
                    style={{ borderColor: '#8A7A68', color: '#6E5A48', background: '#FAFAF8' }}
                  >
                    Handle Requests
                  </Button>
                </Link>
              </Space>
            </Card>
          </Space>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;