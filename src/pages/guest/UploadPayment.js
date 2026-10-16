import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  Table,
  Tag,
  Alert,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

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

export default function UploadPayment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === '1';

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    type: 'down_payment',
    amount: '',
    method: 'gcash',
    referenceNo: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(null);

  const loadData = () => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/payments/booking/${id}`),
    ])
      .then(([bookingRes, paymentsRes]) => {
        setBooking(bookingRes.data);
        setPayments(paymentsRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load booking details')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Countdown
  useEffect(() => {
    if (
      !booking ||
      booking.status !== 'pending' ||
      !booking.expiresAt ||
      booking.paymentStatus !== 'unpaid'
    ) {
      setRemaining(null);
      return;
    }

    const target = new Date(booking.expiresAt).getTime();

    const tick = () => {
      const diff = target - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  // On expiry, reload data
  useEffect(() => {
    if (remaining === 0 && booking?.status === 'pending') {
      const timeout = setTimeout(() => loadData(), 3000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const formatCountdown = (ms) => {
    if (ms == null) return '';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('bookingId', id);
      data.append('type', form.type);
      data.append('amount', form.amount);
      data.append('method', form.method);
      data.append('referenceNo', form.referenceNo);
      if (file) data.append('proofImage', file);

      await api.post('/payments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Payment submitted! Awaiting verification.');
      setForm({ type: 'down_payment', amount: '', method: 'gcash', referenceNo: '' });
      setFile(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Tag style={{ background: C.medium, color: '#FAFAF8', border: 'none' }}>
            VERIFIED
          </Tag>
        );
      case 'pending':
        return (
          <Tag style={{ background: C.gray, color: '#FAFAF8', border: 'none' }}>
            PENDING
          </Tag>
        );
      case 'rejected':
        return <Tag color="error">REJECTED</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const paymentColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t) => t.replace('_', ' ').toUpperCase(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt) => (
        <span style={{ color: C.green, fontWeight: 'bold' }}>
          ₱{amt?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (m) => m.toUpperCase(),
    },
    {
      title: 'Ref No.',
      dataIndex: 'referenceNo',
      key: 'referenceNo',
      render: (ref) => ref || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: C.gray }}>
          Loading payment portal...
        </p>
      </div>
    );
  }

  const isExpired = booking?.status === 'payment_timeout';
  const timerActive = remaining !== null && remaining > 0;

  return (
    <div style={{ maxWidth: '750px', margin: '24px auto', padding: '0 16px' }}>
      <p>
        <Link
          to={`/guest/bookings/${id}`}
          style={{ color: C.medium, fontWeight: '500' }}
        >
          <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Booking
        </Link>
      </p>

      <Card
        title={
          <Title level={3} style={{ margin: 0, color: C.green }}>
            Upload Payment
          </Title>
        }
        style={{
          borderRadius: '8px',
          background: C.white,
          border: `1px solid ${C.border}`,
        }}
      >
        {isNew && timerActive && (
          <Alert
            icon={<CheckCircleOutlined />}
            message="Slot reserved! Complete your down payment to confirm."
            type="success"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        {timerActive && (
          <Alert
            icon={<ClockCircleOutlined />}
            message={
              <span>
                <strong>Payment due in {formatCountdown(remaining)}</strong> —
                upload your down payment to secure this slot.
              </span>
            }
            type="warning"
            showIcon={false}
            style={{
              marginBottom: 16,
              background: '#FFF7E6',
              border: '1px solid #FFD591',
              borderRadius: 8,
            }}
          />
        )}

        {isExpired && (
          <Alert
            message={
              <span>
                <strong>Payment timeout.</strong> This booking expired because
                no payment was submitted within 15 minutes. Please create a new
                booking.
              </span>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        {booking && (
          <div
            style={{
              background: C.cream,
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '24px',
              border: `1px solid ${C.border}`,
            }}
          >
            <Text strong style={{ color: '#333' }}>
              Booking {booking.bookingRef}
            </Text>
            <div style={{ marginTop: '4px', color: C.gray }}>
              Total:{' '}
              <strong style={{ color: C.green }}>
                ₱{booking.pricing?.totalAmount?.toLocaleString()}
              </strong>{' '}
              | Down payment:{' '}
              <strong style={{ color: C.green }}>
                ₱{booking.pricing?.downPayment?.toLocaleString()}
              </strong>{' '}
              | Balance:{' '}
              <strong style={{ color: C.green }}>
                ₱{booking.pricing?.balanceDue?.toLocaleString()}
              </strong>
            </div>
          </div>
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        {message && (
          <Alert
            message={message}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Hide form entirely if expired */}
        {isExpired ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Link to="/guest/book">
              <Button
                type="primary"
                style={{
                  background: C.green,
                  borderColor: C.green,
                  height: 44,
                  fontWeight: 600,
                }}
              >
                Create a New Booking
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Payment Type
                </Text>
              </label>
              <Select
                value={form.type}
                onChange={(value) => setForm({ ...form, type: value })}
                style={{ width: '100%', marginTop: '6px' }}
                size="large"
              >
                <Option value="down_payment">Down Payment</Option>
                <Option value="balance">Balance</Option>
              </Select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Amount (₱)
                </Text>
              </label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder="Enter amount"
                size="large"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Payment Method
                </Text>
              </label>
              <Select
                value={form.method}
                onChange={(value) => setForm({ ...form, method: value })}
                style={{ width: '100%', marginTop: '6px' }}
                size="large"
              >
                <Option value="gcash">GCash</Option>
                <Option value="maya">Maya</Option>
                <Option value="bank">Bank Transfer</Option>
                <Option value="cash">Cash</Option>
              </Select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Reference Number
                </Text>
              </label>
              <Input
                type="text"
                value={form.referenceNo}
                onChange={(e) =>
                  setForm({ ...form, referenceNo: e.target.value })
                }
                placeholder="e.g., 100293848123"
                size="large"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Proof Image / Receipt (JPG, PNG, PDF)
                </Text>
              </label>
              <div style={{ marginTop: '8px' }}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    background: C.white,
                    color: '#333',
                  }}
                />
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
              icon={<UploadOutlined />}
              style={{
                background: C.green,
                borderColor: C.green,
                color: '#FAFAF8',
                height: 46,
                fontWeight: 600,
              }}
            >
              {submitting ? 'Submitting Payment...' : 'Submit Payment'}
            </Button>
          </form>
        )}

        <Divider style={{ borderColor: C.border }} />

        <Title level={4} style={{ color: C.green }}>
          Payment History
        </Title>
        <Table
          dataSource={payments.map((p, idx) => ({ ...p, key: p._id || idx }))}
          columns={paymentColumns}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <span style={{ color: C.brown }}>No payments submitted yet.</span>
            ),
          }}
        />
      </Card>
    </div>
  );
}