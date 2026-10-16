import { useEffect, useState } from 'react';
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
  Form,
  Divider,
  Table,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  FileImageOutlined,
  PlusCircleOutlined,
  UserOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const statusConfigs = {
  verified: { color: '#4F6F52', bg: '#4F6F5220', label: 'Verified' },
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  rejected: { color: '#333333', bg: '#33333320', label: 'Rejected' },
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

const computeRemainingBalance = (booking, allPayments) => {
  if (!booking) return 0;
  const totalAmount = booking.pricing?.totalAmount || 0;
  const paid = allPayments
    .filter(
      (p) =>
        (p.booking?._id || p.booking) === booking._id &&
        p.status === 'verified' &&
        p.type !== 'refund'
    )
    .reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, totalAmount - paid);
};

const StaffPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pageError, setPageError] = useState('');
  const [cashMessage, setCashMessage] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [cashForm, setCashForm] = useState({
    bookingId: '',
    amount: '',
  });

  const setWithAutoDismiss = (setter, value) => {
    setter(value);
    setTimeout(() => {
      setter((current) => (current === value ? null : current));
    }, 4000);
  };

  const loadData = () => {
    Promise.all([api.get('/payments'), api.get('/bookings')])
      .then(([paymentsRes, bookingsRes]) => {
        setPayments(paymentsRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((err) =>
        setPageError(err.response?.data?.error || 'Failed to load data')
      );
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleBookingSelect = (bookingId) => {
    const selected = bookings.find((b) => b._id === bookingId);
    const balance = computeRemainingBalance(selected, payments);
    setCashForm({
      bookingId,
      amount: balance ? String(balance) : '',
    });
  };

  const verify = async (id) => {
    setPageError('');
    try {
      await api.put(`/payments/${id}/verify`);
      loadData();
    } catch (err) {
      setPageError(err.response?.data?.error || 'Failed to verify payment');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) return;
    setPageError('');
    const id = selectedPaymentId;
    try {
      await api.put(`/payments/${id}/reject`, {
        reason: rejectReason,
      });
      setRejectModalOpen(false);
      setRejectReason('');
      loadData();
    } catch (err) {
      setPageError(err.response?.data?.error || 'Failed to reject payment');
      setRejectModalOpen(false);
      setRejectReason('');
    }
  };

  const submitCash = async () => {
    if (!cashForm.bookingId || !cashForm.amount) return;
    setPageError('');
    try {
      await api.post('/payments/cash', {
        bookingId: cashForm.bookingId,
        type: 'balance',
        amount: Number(cashForm.amount),
      });
      setWithAutoDismiss(setCashMessage, {
        type: 'success',
        text: 'Cash payment recorded successfully.',
      });
      setCashForm({ bookingId: '', amount: '' });
      loadData();
    } catch (err) {
      setWithAutoDismiss(setCashMessage, {
        type: 'error',
        text: err.response?.data?.error || 'Failed to record cash payment',
      });
    }
  };

  const pending = payments.filter((p) => p.status === 'pending');

  const eligibleBookings = bookings.filter(
    (b) =>
      ['confirmed', 'checked_in'].includes(b.status) &&
      b.paymentStatus !== 'paid'
  );

  const columns = [
    {
      title: 'Booking Ref',
      dataIndex: ['booking', 'bookingRef'],
      key: 'bookingRef',
      render: (text) => (
        <span style={{ fontWeight: 600, color: C.green }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <span
          style={{
            textTransform: 'capitalize',
            color: C.gray,
            fontWeight: 500,
          }}
        >
          {text?.replace('_', ' ')}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <strong style={{ color: C.green }}>
          ₱{amount?.toLocaleString()}
        </strong>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (text) => (
        <Tag
          style={{
            background: C.white,
            borderColor: C.border,
            color: C.gray,
          }}
        >
          {text?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = statusConfigs[status] || {
          color: '#333333',
          bg: '#C4BBAF20',
          label: status,
        };
        return (
          <Tag
            style={{
              color: cfg.color,
              backgroundColor: cfg.bg,
              borderColor: cfg.color,
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
  ];

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
            Payment Management
          </h1>
          <p style={{ color: C.gray, fontSize: '0.95rem', margin: 0 }}>
            Verify online transfers and process on-site cash payments
          </p>
        </div>

        {pageError && (
          <Alert
            message={pageError}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            closable
            onClose={() => setPageError('')}
          />
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.5rem',
                color: C.green,
                marginBottom: '16px',
              }}
            >
              Pending Verification ({pending.length})
            </h2>

            {pending.length === 0 ? (
              <div
                style={{
                  background: 'rgba(250, 250, 248, 0.5)',
                  backdropFilter: 'blur(8px)',
                  border: `1px dashed ${C.border}`,
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: C.gray,
                }}
              >
                No pending payments require verification.
              </div>
            ) : (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                {pending.map((p) => (
                  <Card
                    key={p._id}
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
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={14}>
                        <div style={{ marginBottom: '8px' }}>
                          <Tag
                            style={{
                              background: '#3A4D3920',
                              color: C.green,
                              borderColor: C.green,
                              fontWeight: 600,
                            }}
                          >
                            {p.type?.replace('_', ' ').toUpperCase()}
                          </Tag>
                          <span
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              color: C.green,
                              marginLeft: 8,
                            }}
                          >
                            ₱{p.amount?.toLocaleString()}
                          </span>
                          <span style={{ color: C.brown, marginLeft: 8 }}>
                            ({p.method})
                          </span>
                        </div>

                        <div style={{ color: C.gray, fontSize: '0.875rem' }}>
                          <span style={{ marginRight: 16 }}>
                            <BarcodeOutlined /> Booking:{' '}
                            <strong>#{p.booking?.bookingRef}</strong>
                          </span>
                          <span>
                            <UserOutlined /> Guest:{' '}
                            <strong>
                              {p.user?.firstName} {p.user?.lastName}
                            </strong>
                          </span>
                        </div>

                        {p.referenceNo && (
                          <div
                            style={{
                              color: C.brown,
                              fontSize: '0.825rem',
                              marginTop: 4,
                            }}
                          >
                            Ref No: <strong>{p.referenceNo}</strong>
                          </div>
                        )}
                      </Col>

                      <Col xs={24} md={10} style={{ textAlign: 'right' }}>
                        <Space wrap style={{ justifyContent: 'flex-end' }}>
                          {p.proofImage && (
                            <a
                              href={`http://localhost:8000/uploads/${p.proofImage}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                icon={<FileImageOutlined />}
                                style={{
                                  borderColor: C.brown,
                                  color: C.gray,
                                  background: C.white,
                                }}
                              >
                                Proof
                              </Button>
                            </a>
                          )}
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{
                              background: C.medium,
                              borderColor: C.medium,
                            }}
                            onClick={() => verify(p._id)}
                          >
                            Verify
                          </Button>
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            style={{
                              background: C.white,
                              borderColor: '#333333',
                              color: '#333333',
                            }}
                            onClick={() => {
                              setSelectedPaymentId(p._id);
                              setRejectModalOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            )}
          </div>

          <Divider style={{ borderColor: C.border, margin: '12px 0' }} />

          <Card
            title={
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  color: C.green,
                  fontSize: '1.25rem',
                }}
              >
                <PlusCircleOutlined style={{ marginRight: 8 }} /> Record Cash
                Payment
              </span>
            }
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {cashMessage && (
              <Alert
                message={cashMessage.text}
                type={cashMessage.type}
                showIcon
                closable
                onClose={() => setCashMessage(null)}
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            <p style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>
              Cash payments apply only to the remaining balance. Bookings that
              are already fully paid are excluded from the list.
            </p>

            <Form layout="vertical" onFinish={submitCash}>
              <Row gutter={16}>
                <Col xs={24} md={14}>
                  <Form.Item
                    label={
                      <span style={{ color: '#333333', fontWeight: 500 }}>
                        Select Booking
                      </span>
                    }
                    required
                  >
                    <Select
                      placeholder="— Select booking —"
                      value={cashForm.bookingId || undefined}
                      onChange={handleBookingSelect}
                      style={{ width: '100%' }}
                      options={eligibleBookings.map((b) => ({
                        value: b._id,
                        label: `#${b.bookingRef} — ${b.user?.firstName || ''} ${
                          b.user?.lastName || ''
                        }`,
                      }))}
                      notFoundContent="No bookings with an outstanding balance"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={10}>
                  <Form.Item
                    label={
                      <span style={{ color: '#333333', fontWeight: 500 }}>
                        Remaining Balance (₱)
                      </span>
                    }
                    required
                  >
                    <InputNumber
                      prefix="₱"
                      style={{
                        width: '100%',
                        background: C.cream,
                        cursor: 'not-allowed',
                      }}
                      value={cashForm.amount ? Number(cashForm.amount) : null}
                      readOnly
                      disabled
                      placeholder="Select a booking first"
                    />
                    <div
                      style={{
                        color: C.gray,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Auto-filled based on the selected booking's remaining
                      balance.
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Button
                type="primary"
                htmlType="submit"
                icon={<DollarOutlined />}
                disabled={!cashForm.bookingId || !cashForm.amount}
                style={{
                  background: C.green,
                  borderColor: C.green,
                  marginTop: 8,
                }}
              >
                Record Cash Payment
              </Button>
            </Form>
          </Card>

          <Divider style={{ borderColor: C.border, margin: '12px 0' }} />

          <Card
            title={
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  color: C.green,
                  fontSize: '1.25rem',
                }}
              >
                All Transactions ({payments.length})
              </span>
            }
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Table
              dataSource={payments}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 8 }}
              style={{ background: 'transparent' }}
            />
          </Card>
        </Space>
      </div>

      <Modal
        title="Reject Payment"
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
        }}
        okText="Confirm Rejection"
        okButtonProps={{ style: { background: C.gray, borderColor: C.gray } }}
      >
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display: 'block',
              marginBottom: 6,
              fontWeight: 500,
              color: '#333333',
            }}
          >
            Reason for Rejection:
          </label>
          <Input.TextArea
            rows={3}
            placeholder="e.g. Invalid reference number, unreadable receipt..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StaffPayments;