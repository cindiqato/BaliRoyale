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
  Timeline, 
  Modal 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CreditCardOutlined, 
  CloseCircleOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
      .catch((err) => setError(err.response?.data?.error || 'Failed to load booking'))
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
      setRescheduleForm({ newDate: '', newStartTime: '', newEndTime: '', reason: '' });
      loadBooking();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Failed to request reschedule');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#6E5A48' }}>Loading booking details...</p>
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
        return <Tag style={{ background: '#4F6F52', color: '#FAFAF8', border: 'none' }}>{status.toUpperCase()}</Tag>;
      case 'pending':
        return <Tag style={{ background: '#8A7A68', color: '#FAFAF8', border: 'none' }}>PENDING</Tag>;
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
        backgroundColor: '#F4F1EA',
        color: '#333333',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        padding: '40px 20px',
      }}
>
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
      <p>
        <Link to="/guest/bookings" style={{ color: '#4F6F52', fontWeight: '500' }}>
          <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to My Bookings
        </Link>
      </p>

      <Card 
        style={{ 
          borderRadius: '8px', 
          background: '#FAFAF8', 
          border: '1px solid #E2DCD5',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3} style={{ color: '#333', margin: 0 }}>
            Booking {booking.bookingRef}
          </Title>
          <Space>
            {renderStatusTag(booking.status)}
          </Space>
        </div>

        {actionMsg && <Alert message={actionMsg} type="success" showIcon style={{ marginBottom: '16px' }} />}
        {actionErr && <Alert message={actionErr} type="error" showIcon style={{ marginBottom: '16px' }} />}

        {/* Quick Details Badges */}
        <div style={{ background: '#F4F1EA', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #E2DCD5' }}>
          <Space wrap size="large">
            <Text style={{ color: '#6E5A48' }}>Payment Status: <strong style={{ color: '#333' }}>{booking.paymentStatus}</strong></Text>
            <Text style={{ color: '#6E5A48' }}>Deposit Status: <strong style={{ color: '#333' }}>{booking.depositStatus}</strong></Text>
          </Space>
        </div>

        {/* Package Information */}
        <Title level={4} style={{ color: '#333' }}>Package & Schedule</Title>
        <Descriptions bordered column={1} size="small" labelStyle={{ width: '160px', fontWeight: 'bold', background: '#F4F1EA', color: '#333' }}>
          <Descriptions.Item label="Package Name">{booking.package?.name}</Descriptions.Item>
          <Descriptions.Item label="Date">{new Date(booking.bookingDate).toDateString()}</Descriptions.Item>
          <Descriptions.Item label="Time">{booking.startTime} – {booking.endTime}</Descriptions.Item>
          <Descriptions.Item label="Guests">{booking.guestCount} Persons</Descriptions.Item>
          {booking.specialRequests && (
            <Descriptions.Item label="Special Requests">{booking.specialRequests}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider style={{ borderColor: '#E2DCD5' }} />

        {/* Pricing Summary */}
        <Title level={4} style={{ color: '#333' }}>Pricing Breakdown</Title>
        <Descriptions bordered column={1} size="small" labelStyle={{ width: '160px', fontWeight: 'bold', background: '#F4F1EA', color: '#333' }}>
          <Descriptions.Item label="Base Rate">₱{booking.pricing?.baseRate?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Excess Pax Fee">₱{booking.pricing?.excessPaxFee?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Security Deposit">₱{booking.pricing?.securityDeposit?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={<Text strong style={{ color: '#333' }}>Total Amount</Text>}>
            <Text strong style={{ color: '#3A4D39', fontSize: '15px' }}>₱{booking.pricing?.totalAmount?.toLocaleString()}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Down Payment">₱{booking.pricing?.downPayment?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Balance Due">₱{booking.pricing?.balanceDue?.toLocaleString()}</Descriptions.Item>
        </Descriptions>

        <Divider style={{ borderColor: '#E2DCD5' }} />

        {/* Status History */}
        <Title level={4} style={{ color: '#333' }}>Status History</Title>
        {booking.statusHistory && booking.statusHistory.length > 0 ? (
          <div style={{ marginTop: '12px' }}>
            {booking.statusHistory.map((h, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '13px', color: '#6E5A48' }}>
                <strong style={{ color: '#333' }}>{h.status}</strong> — {new Date(h.changedAt).toLocaleString()}
                {h.remarks && ` — ${h.remarks}`}
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">No status history yet.</Text>
        )}

        <Divider style={{ borderColor: '#E2DCD5' }} />

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Space wrap>
            {['pending', 'confirmed', 'checked_in'].includes(booking.status) && (
              <Link to={`/guest/payments/${booking._id}`}>
                <Button 
                  type="primary" 
                  icon={<CreditCardOutlined />}
                  style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
                >
                  Upload Payment
                </Button>
              </Link>
            )}

            {canAct && !booking.cancelRequested && !booking.rescheduleRequested && (
              <>
                <Button 
                  danger 
                  onClick={() => setShowCancel(true)}
                >
                  Request Cancel
                </Button>
                <Button 
                  onClick={() => setShowReschedule(true)}
                  style={{ borderColor: '#C4BBAF', color: '#333' }}
                >
                  Request Reschedule
                </Button>
              </>
            )}
          </Space>

          {booking.cancelRequested && <p style={{ color: '#8A7A68', marginTop: '12px' }}>⏳ Cancellation request pending</p>}
          {booking.rescheduleRequested && <p style={{ color: '#8A7A68', marginTop: '12px' }}>⏳ Reschedule request pending</p>}
        </div>

        {/* Cancellation Form Modal / Box */}
        {showCancel && (
          <Card style={{ marginTop: '24px', background: '#FAFAF8', border: '1px solid #E2DCD5' }} title="Request Cancellation">
            <TextArea
              placeholder="State your reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              style={{ marginBottom: '16px' }}
            />
            <Space>
              <Button type="primary" danger onClick={submitCancel}>Submit Request</Button>
              <Button onClick={() => setShowCancel(false)} style={{ borderColor: '#C4BBAF' }}>Cancel</Button>
            </Space>
          </Card>
        )}

        {/* Reschedule Form Modal / Box */}
        {showReschedule && (
          <Card style={{ marginTop: '24px', background: '#FAFAF8', border: '1px solid #E2DCD5' }} title="Request Reschedule">
            <div style={{ marginBottom: '16px' }}>
              <label><Text strong style={{ color: '#333' }}>New Date</Text></label>
              <Input
                type="date"
                value={rescheduleForm.newDate}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                size="large"
                style={{ marginTop: '6px' }}
              />
            </div>
            <Space style={{ width: '100%', marginBottom: '16px' }} direction="vertical">
              <Input
                type="text"
                placeholder="Start time (e.g. 9AM)"
                value={rescheduleForm.newStartTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                size="large"
              />
              <Input
                type="text"
                placeholder="End time (e.g. 5PM)"
                value={rescheduleForm.newEndTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                size="large"
              />
            </Space>
            <div style={{ marginBottom: '16px' }}>
              <TextArea
                placeholder="Reason for rescheduling..."
                value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                rows={2}
              />
            </div>
            <Space>
              <Button 
                type="primary" 
                onClick={submitReschedule}
                style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
              >
                Submit Request
              </Button>
              <Button onClick={() => setShowReschedule(false)} style={{ borderColor: '#C4BBAF' }}>Cancel</Button>
            </Space>
          </Card>
        )}
      </Card>
    </div>
    </div>
  );
}