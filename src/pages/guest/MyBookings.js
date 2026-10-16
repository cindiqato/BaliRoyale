import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Button, Card, Alert, Row, Col, Space, Empty } from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const statusConfigs = {
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  confirmed: { color: '#4F6F52', bg: '#4F6F5220', label: 'Confirmed' },
  checked_in: { color: '#3A4D39', bg: '#3A4D3920', label: 'Checked In' },
  completed: { color: '#6E5A48', bg: '#6E5A4820', label: 'Completed' },
  cancelled: { color: '#8A7A68', bg: '#8A7A6820', label: 'Cancelled' },
  no_show: { color: '#333333', bg: '#33333320', label: 'No Show' },
  payment_timeout: { color: '#A13E3E', bg: '#F2DCD5', label: 'Payment Timeout' },
};

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

const useCountdown = (expiresAt, active) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!active || !expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = target - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, active]);

  return remaining;
};

const CountdownRow = ({ booking }) => {
  const active =
    booking.status === 'pending' &&
    booking.paymentStatus === 'unpaid' &&
    booking.expiresAt;

  const remaining = useCountdown(booking.expiresAt, active);

  if (remaining === null) return null;

  const totalSec = Math.floor(remaining / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const text = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div
      style={{
        marginTop: 12,
        padding: '8px 12px',
        background: '#FFF7E6',
        border: '1px solid #FFD591',
        borderRadius: 6,
        fontSize: 13,
        color: '#8A6A00',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      <ClockCircleOutlined />
      <strong>Payment due in {text}</strong>
      <span style={{ color: '#666' }}>
        — upload down payment to secure this slot
      </span>
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const loadBookings = () => {
    api.get('/bookings/mine')
      .then((res) => setBookings(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load bookings')
      );
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 20000);
    return () => clearInterval(interval);
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            My Bookings
          </h1>
          <p
            style={{
              color: C.gray,
              fontSize: '0.95rem',
              margin: '0 0 18px 0',
            }}
          >
            View and manage your current stay reservations
          </p>

          <Link to="/guest/book">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{
                background: C.green,
                borderColor: C.green,
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              Create New Booking
            </Button>
          </Link>
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

        {bookings.length === 0 && !error && (
          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
              textAlign: 'center',
            }}
            bodyStyle={{ padding: '48px 24px' }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: C.gray, fontSize: '1rem' }}>
                  You have no active or previous bookings yet.
                </span>
              }
            >
              <Link to="/guest/book">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    background: C.medium,
                    borderColor: C.medium,
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Create Your First Booking
                </Button>
              </Link>
            </Empty>
          </Card>
        )}

        {bookings.length > 0 && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {bookings.map((b) => {
              const statusCfg = statusConfigs[b.status] || {
                color: '#333333',
                bg: '#C4BBAF20',
                label: b.status,
              };

              return (
                <Card
                  key={b._id}
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    color: '#333333',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: '12px',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        letterSpacing: '0.05em',
                        color: C.green,
                      }}
                    >
                      #{b.bookingRef}
                    </span>
                    <Tag
                      style={{
                        color: statusCfg.color,
                        backgroundColor: statusCfg.bg,
                        borderColor: statusCfg.color,
                        borderRadius: '12px',
                        padding: '2px 10px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      {statusCfg.label}
                    </Tag>
                  </div>

                  <Row gutter={[24, 16]} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={12} md={6}>
                      <div
                        style={{
                          color: C.brown,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        <UserOutlined /> Guest
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>
                        {b.user?.firstName} {b.user?.lastName}
                      </div>
                      <div style={{ color: C.gray, fontSize: '0.85rem' }}>
                        {b.user?.email}
                      </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div
                        style={{
                          color: C.brown,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        <HomeOutlined /> Package
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>
                        {b.package?.name}
                      </div>
                      <div style={{ color: C.gray, fontSize: '0.85rem' }}>
                        {b.guestCount} Guest(s)
                      </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div
                        style={{
                          color: C.brown,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        <CalendarOutlined /> Schedule
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>
                        {new Date(b.bookingDate).toDateString()}
                      </div>
                      <div style={{ color: C.gray, fontSize: '0.85rem' }}>
                        {b.startTime} – {b.endTime}
                      </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div
                        style={{
                          color: C.brown,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        <DollarOutlined /> Payment & Deposit
                      </div>
                      <div style={{ fontWeight: 700, color: C.green }}>
                        ₱{b.pricing?.totalAmount?.toLocaleString()}
                      </div>
                      <div
                        style={{
                          color: C.gray,
                          fontSize: '0.85rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        Pay: {b.paymentStatus} | Dep: {b.depositStatus}
                      </div>
                    </Col>
                  </Row>

                  <CountdownRow booking={b} />

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '16px',
                      marginTop: 12,
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <Link to={`/guest/bookings/${b._id}`}>
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        style={{
                          borderColor: C.brown,
                          color: C.gray,
                          background: C.white,
                        }}
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </Space>
        )}
      </div>
    </div>
  );
};

export default MyBookings;