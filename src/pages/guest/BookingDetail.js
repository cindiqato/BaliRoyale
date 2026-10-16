import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Card,
  Button,
  Typography,
  Space,
  Descriptions,
  Divider,
  Tag,
  Alert,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

export default function BookingDetail() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [remaining, setRemaining] = useState(null);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    reason: '',
  });

  const reloadedOnExpiry = useRef(false);

  const loadData = () => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/payments/booking/${id}`),
    ])
      .then(([b, p]) => {
        setBooking(b.data);
        setPayments(p.data);
      })
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load booking')
      );
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    reloadedOnExpiry.current = false;
  }, [id]);

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

  const formatCountdown = (ms) => {
    if (ms == null) return '';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const submitCancel = async () => {
    if (!window.confirm('Request to cancel this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/cancel-request`, { reason: cancelReason });
      setActionMsg('Cancellation requested.');
      setShowCancel(false);
      setCancelReason('');
      loadData();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Failed to request cancel');
    }
  };

  const submitReschedule = async () => {
    if (!window.confirm('Request to reschedule this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/reschedule-request`, {
        newDate: rescheduleForm.newDate,
        reason: rescheduleForm.reason,
      });
      setActionMsg('Reschedule requested.');
      setShowReschedule(false);
      setRescheduleForm({ newDate: '', reason: '' });
      loadData();
    } catch (err) {
      setActionErr(
        err.response?.data?.error || 'Failed to request reschedule'
      );
    }
  };

  const hasPendingPayment = payments.some((p) => p.status === 'pending');
  const isFullyPaid = booking?.paymentStatus === 'paid';

  const canAct =
    booking && ['pending', 'confirmed'].includes(booking.status);
  const isExpired = booking?.status === 'payment_timeout';
  const cancelPending = booking?.cancelRequested;
  const reschedulePending = booking?.rescheduleRequested;

  // Hide Upload Payment if there's a pending payment OR the booking is fully paid
  const canUploadPayment =
    booking &&
    ['pending', 'confirmed', 'checked_in'].includes(booking.status) &&
    !cancelPending &&
    !hasPendingPayment &&
    !isFullyPaid;

  const canRequestCancel =
    canAct && !cancelPending && !reschedulePending;

  const canRequestReschedule =
    canAct && !cancelPending && !reschedulePending;

  const renderStatusTag = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <Tag style={{ background: C.medium, color: '#FAFAF8', border: 'none' }}>
            CONFIRMED
          </Tag>
        );
      case 'pending':
        return (
          <Tag style={{ background: C.gray, color: '#FAFAF8', border: 'none' }}>
            PENDING
          </Tag>
        );
      case 'payment_timeout':
        return (
          <Tag style={{ background: '#F2DCD5', color: '#A13E3E', border: 'none' }}>
            PAYMENT TIMEOUT
          </Tag>
        );
      case 'cancelled':
        return <Tag color="error">CANCELLED</Tag>;
      default:
        return <Tag color="default">{status?.toUpperCase()}</Tag>;
    }
  };

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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        <p>
          <Link to="/guest/bookings" style={{ color: C.medium, fontWeight: 500 }}>
            <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to My
            Bookings
          </Link>
        </p>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {booking && (
          <Card
            style={{
              borderRadius: '12px',
              background: C.white,
              border: `1px solid ${C.border}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <Title level={3} style={{ color: C.green, margin: 0 }}>
                Booking {booking.bookingRef}
              </Title>
              <Space>{renderStatusTag(booking.status)}</Space>
            </div>

            {remaining !== null && !hasPendingPayment && (
              <Alert
                icon={<ClockCircleOutlined />}
                message={
                  <span>
                    <strong>Payment due in {formatCountdown(remaining)}</strong>{' '}
                    — upload your down payment to secure this slot.
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
                message="Payment submitted. Awaiting staff verification."
                type="info"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            {isExpired && (
              <Alert
                message={
                  <span>
                    <strong>Payment timeout.</strong> Your booking expired
                    because no payment was submitted within 15 minutes. Please
                    create a new booking.
                  </span>
                }
                type="error"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            {actionMsg && (
              <Alert
                message={actionMsg}
                type="success"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            {actionErr && (
              <Alert
                message={actionErr}
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            <div
              style={{
                background: C.cream,
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '24px',
                border: `1px solid ${C.border}`,
              }}
            >
              <Space wrap size="large">
                <Text style={{ color: C.gray }}>
                  Payment Status:{' '}
                  <strong style={{ color: '#333' }}>
                    {booking.paymentStatus}
                  </strong>
                </Text>
                <Text style={{ color: C.gray }}>
                  Deposit Status:{' '}
                  <strong style={{ color: '#333' }}>
                    {booking.depositStatus}
                  </strong>
                </Text>
              </Space>
            </div>

            <Title level={4} style={{ color: C.green }}>
              Package & Schedule
            </Title>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{
                width: '160px',
                fontWeight: 'bold',
                background: C.cream,
                color: '#333',
              }}
            >
              <Descriptions.Item label="Package Name">
                {booking.package?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {new Date(booking.bookingDate).toDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {booking.startTime} – {booking.endTime}
              </Descriptions.Item>
              <Descriptions.Item label="Guests">
                {booking.guestCount} Persons
              </Descriptions.Item>
              {booking.specialRequests && (
                <Descriptions.Item label="Special Requests">
                  {booking.specialRequests}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ borderColor: C.border }} />

            <Title level={4} style={{ color: C.green }}>
              Pricing Breakdown
            </Title>
            <Text
              style={{
                display: 'block',
                color: C.gray,
                fontSize: 12,
                fontStyle: 'italic',
                marginBottom: 12,
              }}
            >
              These are the original calculated amounts at booking time.
            </Text>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{
                width: '160px',
                fontWeight: 'bold',
                background: C.cream,
                color: '#333',
              }}
            >
              <Descriptions.Item label="Base Rate">
                ₱{booking.pricing?.baseRate?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Excess Pax Fee">
                ₱{booking.pricing?.excessPaxFee?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Security Deposit">
                ₱{booking.pricing?.securityDeposit?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text strong style={{ color: '#333' }}>
                    Total Amount
                  </Text>
                }
              >
                <Text strong style={{ color: C.green, fontSize: '15px' }}>
                  ₱{booking.pricing?.totalAmount?.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Initial Down Payment">
                ₱{booking.pricing?.downPayment?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Initial Balance Due">
                ₱{booking.pricing?.balanceDue?.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: C.border }} />

            <Title level={4} style={{ color: C.green }}>
              Status History
            </Title>
            {booking.statusHistory && booking.statusHistory.length > 0 ? (
              <div style={{ marginTop: '12px' }}>
                {booking.statusHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: '8px',
                      fontSize: '13px',
                      color: C.gray,
                    }}
                  >
                    <strong style={{ color: '#333' }}>
                      {h.status.replace('_', ' ')}
                    </strong>{' '}
                    — {new Date(h.changedAt).toLocaleString()}
                    {h.remarks && ` — ${h.remarks}`}
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">No status history yet.</Text>
            )}

            <Divider style={{ borderColor: C.border }} />

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Space wrap>
                {canUploadPayment && (
                  <Link to={`/guest/payments/${booking._id}`}>
                    <Button
                      type="primary"
                      icon={<CreditCardOutlined />}
                      style={{
                        background: C.green,
                        borderColor: C.green,
                        color: '#FAFAF8',
                      }}
                    >
                      Upload Payment
                    </Button>
                  </Link>
                )}

                {canRequestCancel && (
                  <Button danger onClick={() => setShowCancel(true)}>
                    Request Cancel
                  </Button>
                )}

                {canRequestReschedule && (
                  <Button
                    onClick={() => setShowReschedule(true)}
                    style={{ borderColor: C.border, color: '#333' }}
                  >
                    Request Reschedule
                  </Button>
                )}
              </Space>

              {cancelPending && (
                <p style={{ color: C.gray, marginTop: '12px' }}>
                  ⏳ Cancellation request pending
                </p>
              )}
              {reschedulePending && (
                <p style={{ color: C.gray, marginTop: '12px' }}>
                  ⏳ Reschedule request pending
                </p>
              )}
            </div>

            {showCancel && (
              <Card
                style={{
                  marginTop: '24px',
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                }}
                title="Request Cancellation"
              >
                <TextArea
                  placeholder="State your reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '16px' }}
                />
                <Space>
                  <Button type="primary" danger onClick={submitCancel}>
                    Submit Request
                  </Button>
                  <Button
                    onClick={() => setShowCancel(false)}
                    style={{ borderColor: C.border }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            )}

            {showReschedule && (
              <Card
                style={{
                  marginTop: '24px',
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                }}
                title="Request Reschedule"
              >
                <div style={{ marginBottom: '8px' }}>
                  <Text style={{ color: C.gray, fontSize: '13px' }}>
                    Times are fixed by the package. Pick a new date below.
                  </Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label>
                    <Text strong style={{ color: '#333' }}>
                      New Date
                    </Text>
                  </label>
                  <Input
                    type="date"
                    value={rescheduleForm.newDate}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        newDate: e.target.value,
                      })
                    }
                    size="large"
                    style={{ marginTop: '6px' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <TextArea
                    placeholder="Reason for rescheduling..."
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        reason: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <Space>
                  <Button
                    type="primary"
                    onClick={submitReschedule}
                    style={{
                      background: C.green,
                      borderColor: C.green,
                      color: '#FAFAF8',
                    }}
                  >
                    Submit Request
                  </Button>
                  <Button
                    onClick={() => setShowReschedule(false)}
                    style={{ borderColor: C.border }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}