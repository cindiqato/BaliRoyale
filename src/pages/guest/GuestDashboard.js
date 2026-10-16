import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Row, Col, Statistic, Space } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DollarOutlined,
  BookOutlined,
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
  border: '#C4BBAF',
  pink: '#F2DCD5',
};

const GuestDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/guest')
      .then((res) => setStats(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load dashboard')
      );
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: C.cream,
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2.5rem',
              fontWeight: '600',
              color: C.green,
              letterSpacing: '0.05em',
              margin: '0 0 8px 0',
            }}
          >
            Welcome, {user?.firstName}!
          </h1>
          <p style={{ color: C.gray, fontSize: '0.95rem', margin: 0 }}>
            Here's a summary of your stay and bookings.
          </p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
          />
        )}

        {stats && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={8}>
                <Card
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Total Bookings
                      </span>
                    }
                    value={stats.totalBookings}
                    prefix={<BookOutlined style={{ color: C.green }} />}
                    valueStyle={{
                      color: C.green,
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
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
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Pending
                      </span>
                    }
                    value={stats.pending}
                    prefix={<ClockCircleOutlined style={{ color: C.brown }} />}
                    valueStyle={{
                      color: C.brown,
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
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
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Confirmed
                      </span>
                    }
                    value={stats.confirmed}
                    prefix={<CheckCircleOutlined style={{ color: C.medium }} />}
                    valueStyle={{
                      color: C.medium,
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
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
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Completed
                      </span>
                    }
                    value={stats.completed}
                    prefix={<CheckCircleOutlined style={{ color: C.gray }} />}
                    valueStyle={{
                      color: C.gray,
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
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
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Cancelled
                      </span>
                    }
                    value={stats.cancelled}
                    prefix={<StopOutlined style={{ color: '#333333' }} />}
                    valueStyle={{
                      color: '#333333',
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
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
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={
                      <span style={{ color: C.brown, fontWeight: 600 }}>
                        Total Paid
                      </span>
                    }
                    value={stats.totalPaid}
                    prefix={<DollarOutlined style={{ color: C.green }} />}
                    formatter={(val) => `₱${val?.toLocaleString()}`}
                    valueStyle={{
                      color: C.green,
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              bordered={false}
              style={{
                background: 'rgba(250, 250, 248, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                textAlign: 'center',
              }}
              bodyStyle={{ padding: '28px 20px' }}
            >
              <h3
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.25rem',
                  color: C.green,
                  marginBottom: '20px',
                }}
              >
                Quick Actions
              </h3>

              <Space wrap size="middle" style={{ justifyContent: 'center' }}>
                <Link to="/guest/book">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ background: C.green, borderColor: C.green }}
                  >
                    New Booking
                  </Button>
                </Link>

                <Link to="/guest/bookings">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    size="large"
                    style={{ background: C.medium, borderColor: C.medium }}
                  >
                    My Bookings
                  </Button>
                </Link>

                <Link to="/packages">
                  <Button
                    size="large"
                    icon={<AppstoreOutlined />}
                    style={{
                      borderColor: C.brown,
                      color: C.gray,
                      background: C.white,
                    }}
                  >
                    Browse Packages
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

export default GuestDashboard;