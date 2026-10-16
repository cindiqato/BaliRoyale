import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import {
  Card,
  Input,
  Select,
  Button,
  Typography,
  Divider,
  Table,
  Tag,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
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
  const [remaining, setRemaining] = useState(null);

  const reloadedOnExpiry = useRef(false);

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
      );
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    reloadedOnExpiry.current = false;
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

  // Auto-fill amount whenever the payment type or booking/payments change
  useEffect(() => {
    if (!booking) return;

    const totalPaid = payments
      .filter((p) => p.status === 'verified' && p.type !== 'refund')
      .reduce((sum, p) => sum + p.amount, 0);

    let auto = 0;
    if (form.type === 'down_payment') auto = booking.pricing?.downPayment || 0;
    else if (form.type === 'full_payment') auto = booking.pricing?.totalAmount || 0;
    else if (form.type === 'balance') {
      auto = Math.max(0, (booking.pricing?.totalAmount || 0) - totalPaid);
    }

    setForm((f) => ({ ...f, amount: auto ? String(auto) : '' }));
  }, [form.type, booking, payments]);

  // Reload once on expiry
  useEffect(() => {
    if (
      remaining === 0 &&
      booking?.status === 'pending' &&
      !reloadedOnExpiry.current
    ) {
      reloadedOnExpiry.current = true;
      const timeout = setTimeout(() => loadData(), 3000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // If we're in balance mode, default the form type to "balance"
  useEffect(() => {
    if (!booking) return;
    const isBalancePayment =
      (booking.status === 'pending' && booking.paymentStatus === 'partial') ||
      (['confirmed', 'checked_in'].includes(booking.status) &&
        booking.paymentStatus !== 'paid');

    if (isBalancePayment && form.type !== 'balance') {
      setForm((f) => ({ ...f, type: 'balance' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

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

    if (!file) {
      setError('Please upload your proof of payment (image or PDF).');
      return;
    }
    if (!form.referenceNo.trim()) {
      setError('Please enter the reference number from your receipt.');
      return;
    }
    if (!form.method) {
      setError('Please select a payment method.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('bookingId', id);
      data.append('type', form.type);
      data.append('method', form.method);
      data.append('referenceNo', form.referenceNo.trim());
      data.append('proofImage', file);

      await api.post('/payments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Payment submitted! Awaiting staff verification.');
      setForm((f) => ({ ...f, referenceNo: '' }));
      setFile(null);
      const fileInput = document.getElementById('proof-file-input');
      if (fileInput) fileInput.value = '';
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

  const renderTypeLabel = (t) => {
    if (t === 'down_payment') return 'DOWN PAYMENT';
    if (t === 'balance') return 'BALANCE';
    if (t === 'full_payment') return 'FULL PAYMENT';
    if (t === 'refund') return 'REFUND';
    return t;
  };

  const paymentColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t) => renderTypeLabel(t),
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

  // ----- Render -----

  if (!booking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          color: C.gray,
        }}
      >
        {error || 'Loading...'}
      </div>
    );
  }

  const isExpired = booking.status === 'payment_timeout';
  const isPaid = booking.paymentStatus === 'paid';
  const isCancelled = ['cancelled', 'completed', 'no_show'].includes(
    booking.status
  );
  const timerActive = remaining !== null && remaining > 0;
  const hasPendingPayment = payments.some((p) => p.status === 'pending');

  const isInitialPayment =
    booking.status === 'pending' && booking.paymentStatus === 'unpaid';
  const isBalancePayment =
    (booking.status === 'pending' && booking.paymentStatus === 'partial') ||
    (['confirmed', 'checked_in'].includes(booking.status) &&
      booking.paymentStatus !== 'paid');

  const canPay = isInitialPayment || isBalancePayment;

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
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 16px' }}>
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

          {hasPendingPayment && !isExpired && (
            <Alert
              icon={<InfoCircleOutlined />}
              message={
                <span>
                  <strong>Payment submitted.</strong> Awaiting staff
                  verification. Your booking will be confirmed once the payment
                  is verified.
                </span>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {isExpired && (
            <Alert
              message={
                <span>
                  <strong>Payment timeout.</strong> This booking expired because
                  no payment was submitted within 15 minutes. Please create a
                  new booking.
                </span>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {isPaid && !isExpired && (
            <Alert
              message={
                <span>
                  <strong>Fully paid.</strong> This booking has been settled in
                  full. No further payment is needed.
                </span>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {isCancelled && !isExpired && (
            <Alert
              message={
                <span>
                  <strong>Payment unavailable.</strong> This booking is{' '}
                  {booking.status.replace('_', ' ')} and can no longer accept
                  payments.
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

          {!canPay ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {isExpired && (
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
              )}
              {isCancelled && (
                <Link to="/guest/bookings">
                  <Button
                    style={{
                      borderColor: C.border,
                      height: 44,
                      fontWeight: 600,
                    }}
                  >
                    Back to My Bookings
                  </Button>
                </Link>
              )}
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
                  {isInitialPayment && (
                    <>
                      <Option value="down_payment">Down Payment (50%)</Option>
                      <Option value="full_payment">Full Payment (100%)</Option>
                    </>
                  )}
                  {isBalancePayment && (
                    <Option value="balance">Remaining Balance</Option>
                  )}
                </Select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>
                  <Text strong style={{ color: '#333' }}>
                    Amount (₱)
                  </Text>
                </label>
                <Input
                  type="text"
                  value={
                    form.amount
                      ? `₱${Number(form.amount).toLocaleString()}`
                      : ''
                  }
                  readOnly
                  disabled
                  size="large"
                  style={{
                    marginTop: '6px',
                    background: C.cream,
                    color: C.green,
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                />
                <Text style={{ color: C.gray, fontSize: 12 }}>
                  Auto-filled based on your selected payment type.
                </Text>
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
                  <Option value="bank">Bank Transfer</Option>
                </Select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>
                  <Text strong style={{ color: '#333' }}>
                    Reference Number <span style={{ color: '#A13E3E' }}>*</span>
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
                <Text style={{ color: C.gray, fontSize: 12 }}>
                  Enter the reference number from your transaction receipt.
                </Text>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label>
                  <Text strong style={{ color: '#333' }}>
                    Proof Image / Receipt{' '}
                    <span style={{ color: '#A13E3E' }}>*</span>
                  </Text>
                </label>
                <div style={{ marginTop: '8px' }}>
                  <input
                    id="proof-file-input"
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
                <Text style={{ color: C.gray, fontSize: 12 }}>
                  Attach a screenshot or photo of your receipt (JPG, PNG, PDF).
                </Text>
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
                <span style={{ color: C.brown }}>
                  No payments submitted yet.
                </span>
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
}