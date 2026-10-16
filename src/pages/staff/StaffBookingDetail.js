import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Space,
  Descriptions,
  Divider,
  Tag,
  Alert,
  Row,
  Col,
  InputNumber,
  Input,
  Modal,
  List,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  DollarOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  FileImageOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import PageShell from '../../components/PageShell';

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

const statusColors = {
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  confirmed: { color: '#4F6F52', bg: '#4F6F5220', label: 'Confirmed' },
  checked_in: { color: '#3A4D39', bg: '#3A4D3920', label: 'Checked In' },
  completed: { color: '#6E5A48', bg: '#6E5A4820', label: 'Completed' },
  cancelled: { color: '#8A7A68', bg: '#8A7A6820', label: 'Cancelled' },
  no_show: { color: '#333333', bg: '#33333320', label: 'No Show' },
  payment_timeout: { color: '#A13E3E', bg: '#F2DCD5', label: 'Payment Timeout' },
};

export default function StaffBookingDetail() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [acting, setActing] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const [deductOpen, setDeductOpen] = useState(false);
  const [deductAmount, setDeductAmount] = useState(null);
  const [deductReason, setDeductReason] = useState('');

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
      )
      .finally(() => setLoading(false));
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

  const act = async (action, body = null) => {
    setError('');
    setMessage('');
    setActing(true);
    try {
      await api.put(`/bookings/${id}/${action}`, body || {});
      setMessage(`Action "${action}" succeeded.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    } finally {
      setActing(false);
    }
  };

  const submitDeduct = async () => {
    if (!deductAmount || !deductReason) return;
    await act('deposit-deduct', {
      amount: Number(deductAmount),
      reason: deductReason,
    });
    setDeductOpen(false);
    setDeductAmount(null);
    setDeductReason('');
  };

  const renderStatusTag = (status) => {
    const cfg =
      statusColors[status] || {
        color: '#333',
        bg: '#E2DCD520',
        label: status,
      };
    return (
      <Tag
        style={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          borderColor: cfg.color,
          borderRadius: 12,
          padding: '2px 12px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {cfg.label}
      </Tag>
    );
  };

  const verifiedPayments = payments.filter(
    (p) => p.status === 'verified' && p.type !== 'refund'
  );
  const amountPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = booking?.pricing?.totalAmount || 0;
  const remainingBalance = Math.max(0, totalAmount - amountPaid);
  const hasBalance = remainingBalance > 0.01;

  const canCheckIn = booking?.status === 'confirmed';
  const canComplete = booking?.status === 'checked_in' && !hasBalance;
  const canSettleDeposit =
    booking?.status === 'completed' && booking?.depositStatus === 'held';
  const isExpired = booking?.status === 'payment_timeout';
  const awaitingPayment =
    booking?.status === 'pending' && booking?.paymentStatus === 'unpaid';
  const awaitingVerification =
    booking?.status === 'pending' && booking?.paymentStatus !== 'unpaid';

  return (
    <PageShell loading={loading} loadingText="Loading booking details...">
      {error && !booking ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      ) : !booking ? null : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            <Link
              to="/staff/bookings"
              style={{ color: C.medium, fontWeight: 500 }}
            >
              <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to All
              Bookings
            </Link>
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <Title
                level={2}
                style={{
                  color: C.green,
                  fontFamily: 'Georgia, serif',
                  margin: 0,
                }}
              >
                #{booking.bookingRef}
              </Title>
              <Text style={{ color: C.gray }}>
                Booking details and staff actions
              </Text>
            </div>
            {renderStatusTag(booking.status)}
          </div>

          {remaining !== null && (
            <Alert
              icon={<ClockCircleOutlined />}
              message={
                <span>
                  <strong>
                    Guest's payment hold expires in {formatCountdown(remaining)}
                  </strong>
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
                  <strong>Payment timeout.</strong> The slot has been released.
                </span>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {awaitingVerification && (
            <Alert
              message={
                <span>
                  <strong>Awaiting payment verification.</strong>
                </span>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {booking.status === 'checked_in' && hasBalance && (
            <Alert
              icon={<WarningOutlined />}
              message={
                <span>
                  <strong>
                    Remaining balance: ₱{remainingBalance.toLocaleString()}
                  </strong>{' '}
                  — this booking cannot be completed until the full amount is
                  settled. Record a cash payment or wait for an online balance
                  payment to be verified.
                </span>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {message && (
            <Alert
              message={message}
              type="success"
              showIcon
              closable
              onClose={() => setMessage('')}
              style={{ marginBottom: 16 }}
            />
          )}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 16 }}
            />
          )}

          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.85)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 20,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Title level={5} style={{ color: C.green, marginTop: 0 }}>
              Staff Actions
            </Title>
            <Space wrap>
              {canCheckIn && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={acting}
                    onClick={() => act('checkin')}
                    style={{ background: C.green, borderColor: C.green }}
                  >
                    Check In Guest
                  </Button>
                  <Button
                    icon={<StopOutlined />}
                    loading={acting}
                    onClick={() => act('noshow')}
                    style={{ borderColor: C.brown, color: C.brown }}
                  >
                    Mark No Show
                  </Button>
                </>
              )}

              {canComplete && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={acting}
                  onClick={() => act('complete')}
                  style={{ background: C.medium, borderColor: C.medium }}
                >
                  Complete Booking
                </Button>
              )}

              {booking.status === 'checked_in' && hasBalance && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  disabled
                  style={{
                    background: '#C4BBAF',
                    borderColor: '#C4BBAF',
                    color: '#FAFAF8',
                    cursor: 'not-allowed',
                  }}
                >
                  Complete Booking
                </Button>
              )}

              {canSettleDeposit && (
                <>
                  <Button
                    type="primary"
                    icon={<DollarOutlined />}
                    loading={acting}
                    onClick={() => act('deposit-return')}
                    style={{ background: C.green, borderColor: C.green }}
                  >
                    Return Deposit
                  </Button>
                  <Button
                    icon={<CloseCircleOutlined />}
                    onClick={() => setDeductOpen(true)}
                    style={{ borderColor: C.brown, color: C.brown }}
                  >
                    Deduct Deposit
                  </Button>
                </>
              )}

              {awaitingPayment && (
                <Text style={{ color: C.gray }}>
                  Waiting for the guest to submit payment.
                </Text>
              )}

              {awaitingVerification && (
                <Text style={{ color: C.gray }}>
                  Guest has submitted a payment. Verify it from the{' '}
                  <Link
                    to="/staff/payments"
                    style={{ color: C.medium, fontWeight: 600 }}
                  >
                    Payments page
                  </Link>{' '}
                  to auto-confirm this booking.
                </Text>
              )}

              {!canCheckIn &&
                !canComplete &&
                !canSettleDeposit &&
                !awaitingPayment &&
                !awaitingVerification &&
                !(booking.status === 'checked_in' && hasBalance) && (
                  <Text style={{ color: C.gray }}>
                    No pending actions for this booking.
                  </Text>
                )}
            </Space>
          </Card>

          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.85)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 20,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ color: C.green, marginTop: 0 }}>
              Booking Summary
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Text
                  style={{
                    color: C.brown,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  <UserOutlined /> Guest
                </Text>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#333' }}>
                  {booking.user?.firstName} {booking.user?.lastName}
                </p>
                <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
                  {booking.user?.email}
                </p>
                {booking.user?.phone && (
                  <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
                    {booking.user.phone}
                  </p>
                )}
              </Col>

              <Col xs={24} md={12}>
                <Text
                  style={{
                    color: C.brown,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  <HomeOutlined /> Package
                </Text>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#333' }}>
                  {booking.package?.name}
                </p>
                <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
                  {booking.guestCount} guest(s)
                </p>
              </Col>

              <Col xs={24} md={12}>
                <Text
                  style={{
                    color: C.brown,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  <CalendarOutlined /> Schedule
                </Text>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#333' }}>
                  {new Date(booking.bookingDate).toDateString()}
                </p>
                <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
                  {booking.startTime} – {booking.endTime}
                </p>
              </Col>

              <Col xs={24} md={12}>
                <Text
                  style={{
                    color: C.brown,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  <DollarOutlined /> Payment & Deposit
                </Text>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: C.green }}>
                  ₱{totalAmount.toLocaleString()}
                </p>
                <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
                  Payment: <strong>{booking.paymentStatus}</strong> • Deposit:{' '}
                  <strong>{booking.depositStatus}</strong>
                </p>
                <p style={{ margin: 0, color: C.brown, fontSize: 13 }}>
                  Amount Paid: <strong>₱{amountPaid.toLocaleString()}</strong> •
                  Balance:{' '}
                  <strong style={{ color: hasBalance ? '#A13E3E' : C.green }}>
                    ₱{remainingBalance.toLocaleString()}
                  </strong>
                </p>
              </Col>
            </Row>

            {booking.specialRequests && (
              <>
                <Divider style={{ borderColor: C.pink }} />
                <Text
                  style={{
                    color: C.brown,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Special Requests
                </Text>
                <p style={{ margin: '4px 0 0', color: '#333' }}>
                  {booking.specialRequests}
                </p>
              </>
            )}
          </Card>

          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.85)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 20,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ color: C.green, marginTop: 0 }}>
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
              column={1}
              size="small"
              labelStyle={{ fontWeight: 600, color: C.gray, width: 200 }}
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
              <Descriptions.Item label="Total Amount">
                <strong style={{ color: C.green }}>
                  ₱{booking.pricing?.totalAmount?.toLocaleString()}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Initial Down Payment">
                ₱{booking.pricing?.downPayment?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Initial Balance Due">
                ₱{booking.pricing?.balanceDue?.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.85)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 20,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ color: C.green, marginTop: 0 }}>
              Payment History ({payments.length})
            </Title>

            {payments.length === 0 ? (
              <Text style={{ color: C.gray }}>No payments submitted yet.</Text>
            ) : (
              <List
                dataSource={payments}
                renderItem={(p) => (
                  <List.Item
                    style={{
                      padding: '12px 0',
                      borderBottom: `1px solid ${C.pink}`,
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <Row
                        justify="space-between"
                        align="middle"
                        gutter={[12, 8]}
                      >
                        <Col flex="auto">
                          <Text strong style={{ color: C.green }}>
                            {p.type === 'down_payment'
                              ? 'Down Payment'
                              : p.type === 'balance'
                              ? 'Balance'
                              : p.type === 'full_payment'
                              ? 'Full Payment'
                              : p.type === 'refund'
                              ? 'Refund'
                              : p.type}
                          </Text>
                          <span
                            style={{
                              marginLeft: 10,
                              color: C.gray,
                              fontSize: 13,
                            }}
                          >
                            ₱{p.amount?.toLocaleString()} via {p.method}
                          </span>
                        </Col>
                        <Col>
                          <Tag
                            style={{
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              border: 'none',
                              background:
                                p.status === 'verified'
                                  ? '#E8EFE5'
                                  : p.status === 'rejected'
                                  ? C.pink
                                  : C.cream,
                              color:
                                p.status === 'verified'
                                  ? C.green
                                  : p.status === 'rejected'
                                  ? '#A13E3E'
                                  : C.gray,
                            }}
                          >
                            {p.status}
                          </Tag>
                        </Col>
                      </Row>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: C.brown,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        {p.referenceNo && (
                          <span>
                            <FileTextOutlined /> Ref: {p.referenceNo}
                          </span>
                        )}
                        {p.proofImage && (
                          <a
                            href={`http://localhost:8000/uploads/${p.proofImage}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: C.medium }}
                          >
                            <FileImageOutlined /> View Proof
                          </a>
                        )}
                        {p.rejectionReason && (
                          <span style={{ color: '#A13E3E' }}>
                            Reason: {p.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.85)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ color: C.green, marginTop: 0 }}>
              Status History
            </Title>

            {booking.statusHistory && booking.statusHistory.length > 0 ? (
              <div>
                {booking.statusHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      paddingBottom: 12,
                      marginBottom: 12,
                      borderBottom:
                        i < booking.statusHistory.length - 1
                          ? `1px dashed ${C.pink}`
                          : 'none',
                    }}
                  >
                    <Text
                      strong
                      style={{ color: C.green, textTransform: 'capitalize' }}
                    >
                      {h.status.replace('_', ' ')}
                    </Text>
                    <span
                      style={{ marginLeft: 10, color: C.gray, fontSize: 12 }}
                    >
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                    {h.remarks && (
                      <p
                        style={{
                          margin: '4px 0 0',
                          color: C.brown,
                          fontSize: 13,
                        }}
                      >
                        {h.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Text style={{ color: C.gray }}>No history yet.</Text>
            )}
          </Card>

          <Modal
            title="Deduct Deposit"
            open={deductOpen}
            onOk={submitDeduct}
            onCancel={() => setDeductOpen(false)}
            okText="Submit Deduction"
            okButtonProps={{
              style: { background: C.green, borderColor: C.green },
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Deduction Amount (₱):
              </label>
              <InputNumber
                style={{ width: '100%' }}
                prefix="₱"
                value={deductAmount}
                onChange={(val) => setDeductAmount(val)}
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Reason:
              </label>
              <TextArea
                rows={3}
                value={deductReason}
                onChange={(e) => setDeductReason(e.target.value)}
                placeholder="Describe damage or loss..."
              />
            </div>
          </Modal>
        </div>
      )}
    </PageShell>
  );
}