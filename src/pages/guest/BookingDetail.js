import React, { useEffect, useState } from 'react';
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
  Spin,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });

  const loadBooking = () => {
    api.get(`/bookings/${id}`)
      .then((res) => setBooking(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load booking')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitCancel = async () => {
    if (!window.confirm('Request to cancel this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/cancel-request`, { reason: cancelReason });
      setActionMsg('Cancellation requested.');
      setShowCancel(false);
      setCancelReason('');
      loadBooking();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Failed to request cancel');
    }
  };

  const submitReschedule = async () => {
    if (!window.confirm('Request to reschedule this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/reschedule-request`, rescheduleForm);
      setActionMsg('Reschedule requested.');
      setShowReschedule(false);
      setRescheduleForm({
        newDate: '',
        newStartTime: '',
        newEndTime: '',
        reason: '',
      });
      loadBooking();
    } catch (err) {
      setActionErr(
        err.response?.data?.error || 'Failed to request reschedule'
      );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: C.gray }}>
          Loading booking details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!booking) return null;

  const canAct = ['pending', 'confirmed'].includes(booking.status);

  const renderStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'verified':
        return (
          <Tag style={{ background: C.medium, color: '#FAFAF8', border: 'none' }}>
            {status.toUpperCase()}
          </Tag>
        );
      case 'pending':
        return (
          <Tag style={{ background: C.gray, color: '#FAFAF8', border: 'none' }}>
            PENDING
          </Tag>
        );
      case 'cancelled':
      case 'rejected':
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

          {/* Quick status badges */}
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
              label={<Text strong style={{ color: '#333' }}>Total Amount</Text>}
            >
              <Text strong style={{ color: C.green, fontSize: '15px' }}>
                ₱{booking.pricing?.totalAmount?.toLocaleString()}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Down Payment">
              ₱{booking.pricing?.downPayment?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Balance Due">
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
                  <strong style={{ color: '#333' }}>{h.status}</strong> —{' '}
                  {new Date(h.changedAt).toLocaleString()}
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
              {['pending', 'confirmed', 'checked_in'].includes(
                booking.status
              ) && (
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

              {canAct &&
                !booking.cancelRequested &&
                !booking.rescheduleRequested && (
                  <>
                    <Button danger onClick={() => setShowCancel(true)}>
                      Request Cancel
                    </Button>
                    <Button
                      onClick={() => setShowReschedule(true)}
                      style={{ borderColor: C.border, color: '#333' }}
                    >
                      Request Reschedule
                    </Button>
                  </>
                )}
            </Space>

            {booking.cancelRequested && (
              <p style={{ color: C.gray, marginTop: '12px' }}>
                ⏳ Cancellation request pending
              </p>
            )}
            {booking.rescheduleRequested && (
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
              <Space
                style={{ width: '100%', marginBottom: '16px' }}
                direction="vertical"
              >
                <Input
                  type="text"
                  placeholder="Start time (e.g. 9AM)"
                  value={rescheduleForm.newStartTime}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      newStartTime: e.target.value,
                    })
                  }
                  size="large"
                />
                <Input
                  type="text"
                  placeholder="End time (e.g. 5PM)"
                  value={rescheduleForm.newEndTime}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      newEndTime: e.target.value,
                    })
                  }
                  size="large"
                />
              </Space>
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
      </div>
    </div>
  );
}