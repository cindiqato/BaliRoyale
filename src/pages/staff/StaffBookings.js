import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Button,
  Select,
  Card,
  Alert,
  Row,
  Col,
  Space,
  Modal,
  InputNumber,
  Input,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  StopOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
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

const CountdownInline = ({ booking }) => {
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
    <Tag
      icon={<ClockCircleOutlined />}
      style={{
        background: '#FFF7E6',
        color: '#8A6A00',
        borderColor: '#FFD591',
        fontWeight: 600,
        marginTop: 8,
      }}
    >
      Hold expires in {text}
    </Tag>
  );
};

const StaffBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const [deductModalOpen, setDeductModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [deductAmount, setDeductAmount] = useState(null);
  const [deductReason, setDeductReason] = useState('');

  const loadBookings = () => {
    api.get('/bookings')
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

  const act = async (id, action, body = null) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/bookings/${id}/${action}`, body || {});
      setMessage(`Booking ${action} successful.`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    }
  };

  const handleDeductSubmit = () => {
    if (!deductAmount || !deductReason) return;
    act(selectedBookingId, 'deposit-deduct', {
      amount: Number(deductAmount),
      reason: deductReason,
    });
    setDeductModalOpen(false);
    setDeductAmount(null);
    setDeductReason('');
  };

  const filtered =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filter);

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
            Reservation Management
          </h1>
          <p style={{ color: C.gray, fontSize: '0.95rem', margin: 0 }}>
            Overview and controls for all guest bookings
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
            background: 'rgba(250, 250, 248, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '12px 24px',
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          }}
        >
          <span
            style={{
              fontSize: '0.9rem',
              color: '#333333',
              fontWeight: '500',
            }}
          >
            Filter Status:
          </span>
          <Select
            value={filter}
            onChange={(val) => setFilter(val)}
            style={{ width: 180 }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'checked_in', label: 'Checked In' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'no_show', label: 'No Show' },
              { value: 'payment_timeout', label: 'Payment Timeout' },
            ]}
          />
        </div>

        {message && (
          <Alert
            message={message}
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
            closable
          />
        )}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            closable
          />
        )}

        {filtered.length === 0 && (
          <div
            style={{
              background: 'rgba(250, 250, 248, 0.5)',
              backdropFilter: 'blur(8px)',
              border: `1px dashed ${C.border}`,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: C.gray,
            }}
          >
            No reservations found matching the selected filter.
          </div>
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {filtered.map((b) => {
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

                <CountdownInline booking={b} />

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
                  <Link to={`/staff/bookings/${b._id}`}>
                    <Button
                      type="default"
                      icon={<EyeOutlined />}
                      style={{
                        borderColor: C.brown,
                        color: C.gray,
                        background: C.white,
                      }}
                    >
                      View
                    </Button>
                  </Link>

                  {b.status === 'confirmed' && (
                    <>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{
                          background: C.green,
                          borderColor: C.green,
                        }}
                        onClick={() => act(b._id, 'checkin')}
                      >
                        Check In
                      </Button>
                      <Button
                        style={{
                          background: C.white,
                          borderColor: C.brown,
                          color: C.brown,
                        }}
                        icon={<StopOutlined />}
                        onClick={() => act(b._id, 'noshow')}
                      >
                        No Show
                      </Button>
                    </>
                  )}

                  {b.status === 'checked_in' && (
                    <Button
                      type="primary"
                      style={{
                        background: C.medium,
                        borderColor: C.medium,
                      }}
                      onClick={() => act(b._id, 'complete')}
                    >
                      Complete
                    </Button>
                  )}

                  {b.status === 'completed' && b.depositStatus === 'held' && (
                    <>
                      <Button
                        type="primary"
                        style={{
                          background: C.green,
                          borderColor: C.green,
                        }}
                        onClick={() => act(b._id, 'deposit-return')}
                      >
                        Return Deposit
                      </Button>
                      <Button
                        style={{
                          background: C.gray,
                          borderColor: C.gray,
                          color: C.white,
                        }}
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => {
                          setSelectedBookingId(b._id);
                          setDeductModalOpen(true);
                        }}
                      >
                        Deduct Deposit
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </Space>
      </div>

      <Modal
        title="Deduct Deposit"
        open={deductModalOpen}
        onOk={handleDeductSubmit}
        onCancel={() => setDeductModalOpen(false)}
        okText="Submit Deduction"
        okButtonProps={{ style: { background: C.gray, borderColor: C.gray } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Deduction Amount (₱):
            </label>
            <InputNumber
              style={{ width: '100%' }}
              prefix="₱"
              placeholder="e.g. 500"
              value={deductAmount}
              onChange={(val) => setDeductAmount(val)}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Reason:
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe damage or loss..."
              value={deductReason}
              onChange={(e) => setDeductReason(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default StaffBookings;