import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Button, Select, Card, Spin, Alert, Row, Col, Space, Modal, InputNumber, Input } from 'antd';
import { 
  CheckCircleOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  EyeOutlined,
  StopOutlined,
  HomeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const statusConfigs = {
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  confirmed: { color: '#4F6F52', bg: '#4F6F5220', label: 'Confirmed' },
  checked_in: { color: '#3A4D39', bg: '#3A4D3920', label: 'Checked In' },
  completed: { color: '#6E5A48', bg: '#6E5A4820', label: 'Completed' },
  cancelled: { color: '#8A7A68', bg: '#8A7A6820', label: 'Cancelled' },
  no_show: { color: '#333333', bg: '#33333320', label: 'No Show' },
};

const StaffBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  // Deduction Modal State
  const [deductModalOpen, setDeductModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [deductAmount, setDeductAmount] = useState(null);
  const [deductReason, setDeductReason] = useState('');

  const loadBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
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
    act(selectedBookingId, 'deposit-deduct', { amount: Number(deductAmount), reason: deductReason });
    setDeductModalOpen(false);
    setDeductAmount(null);
    setDeductReason('');
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            Reservation Management
          </h1>
          <p style={{ color: '#6E5A48', fontSize: '0.95rem', margin: 0 }}>
            Overview and controls for all guest bookings
          </p>
        </div>

        {/* Filter Bar (Frosted Glass) */}
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
            border: '1px solid #E2DCD5',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#333333', fontWeight: '500' }}>
            Filter Status:
          </span>
          <Select
            value={filter}
            onChange={(val) => setFilter(val)}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'checked_in', label: 'Checked In' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'no_show', label: 'No Show' },
            ]}
          />
        </div>

        {/* Alerts */}
        {message && (
          <Alert message={message} type="success" showIcon style={{ marginBottom: 20 }} closable />
        )}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} closable />
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ color: '#6E5A48', marginTop: 12 }}>Retrieving reservations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              background: 'rgba(250, 250, 248, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px dashed #C4BBAF',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#6E5A48',
            }}
          >
            No reservations found matching the selected filter.
          </div>
        )}

        {/* Booking Cards (Frosted Glass Aesthetic) */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {!loading &&
            filtered.map((b) => {
              const statusCfg = statusConfigs[b.status] || { color: '#333333', bg: '#C4BBAF20', label: b.status };

              return (
                <Card
                  key={b._id}
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    color: '#333333',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  {/* Top Bar: Reference & Status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #E2DCD5',
                      paddingBottom: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        letterSpacing: '0.05em',
                        color: '#3A4D39',
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
                        fontWeight: 600 
                      }}
                    >
                      {statusCfg.label}
                    </Tag>
                  </div>

                  {/* Grid Content */}
                  <Row gutter={[24, 16]} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={12} md={6}>
                      <div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                        <UserOutlined /> Guest
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>
                        {b.user?.firstName} {b.user?.lastName}
                      </div>
                      <div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>{b.user?.email}</div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                        <HomeOutlined /> Package
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>{b.package?.name}</div>
                      <div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>{b.guestCount} Guest(s)</div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                        <CalendarOutlined /> Schedule
                      </div>
                      <div style={{ fontWeight: 600, color: '#333333' }}>
                        {new Date(b.bookingDate).toDateString()}
                      </div>
                      <div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>
                        {b.startTime} – {b.endTime}
                      </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                        <DollarOutlined /> Payment & Deposit
                      </div>
                      <div style={{ fontWeight: 700, color: '#3A4D39' }}>
                        ₱{b.pricing?.totalAmount?.toLocaleString()}
                      </div>
                      <div style={{ color: '#6E5A48', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        Pay: {b.paymentStatus} | Dep: {b.depositStatus}
                      </div>
                    </Col>
                  </Row>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '16px',
                      borderTop: '1px solid #E2DCD5',
                    }}
                  >
                    <Link to={`/staff/bookings/${b._id}`}>
                      <Button 
                        type="default" 
                        icon={<EyeOutlined />} 
                        style={{ borderColor: '#8A7A68', color: '#6E5A48', background: '#FAFAF8' }}
                      >
                        View
                      </Button>
                    </Link>

                    {b.status === 'pending' && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                        onClick={() => act(b._id, 'confirm')}
                      >
                        Confirm
                      </Button>
                    )}

                    {b.status === 'confirmed' && (
                      <>
                        <Button
                          type="primary"
                          style={{ background: '#3A4D39', borderColor: '#3A4D39' }}
                          onClick={() => act(b._id, 'checkin')}
                        >
                          Check In
                        </Button>
                        <Button
                          style={{ background: '#FAFAF8', borderColor: '#8A7A68', color: '#8A7A68' }}
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
                        style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                        onClick={() => act(b._id, 'complete')}
                      >
                        Complete
                      </Button>
                    )}

                    {b.status === 'completed' && b.depositStatus === 'held' && (
                      <>
                        <Button
                          type="primary"
                          style={{ background: '#3A4D39', borderColor: '#3A4D39' }}
                          onClick={() => act(b._id, 'deposit-return')}
                        >
                          Return Deposit
                        </Button>
                        <Button
                          style={{ background: '#6E5A48', borderColor: '#6E5A48', color: '#FAFAF8' }}
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

      {/* Deduction Modal */}
      <Modal
        title="Deduct Deposit"
        open={deductModalOpen}
        onOk={handleDeductSubmit}
        onCancel={() => setDeductModalOpen(false)}
        okText="Submit Deduction"
        okButtonProps={{ style: { background: '#6E5A48', borderColor: '#6E5A48' } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333333' }}>
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
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333333' }}>Reason:</label>
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