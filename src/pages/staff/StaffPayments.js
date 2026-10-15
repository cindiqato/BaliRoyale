import { useEffect, useState } from 'react';
import { Tag, Button, Select, Card, Spin, Alert, Row, Col, Space, Modal, InputNumber, Input, Form, Divider, Table } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DollarOutlined, 
  FileImageOutlined, 
  PlusCircleOutlined,
  UserOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const statusConfigs = {
  verified: { color: '#4F6F52', bg: '#4F6F5220', label: 'Verified' },
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  rejected: { color: '#333333', bg: '#33333320', label: 'Rejected' },
};

const StaffPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [cashForm, setCashForm] = useState({
    bookingId: '',
    type: 'down_payment',
    amount: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/payments'), api.get('/bookings')])
      .then(([paymentsRes, bookingsRes]) => {
        setPayments(paymentsRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const verify = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/payments/${id}/verify`);
      setMessage('Payment verified successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify payment');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) return;
    setError('');
    setMessage('');
    try {
      await api.put(`/payments/${selectedPaymentId}/reject`, { reason: rejectReason });
      setMessage('Payment rejected.');
      setRejectModalOpen(false);
      setRejectReason('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject payment');
    }
  };

  const submitCash = async () => {
    if (!cashForm.bookingId || !cashForm.amount) return;
    setError('');
    setMessage('');
    try {
      await api.post('/payments/cash', {
        bookingId: cashForm.bookingId,
        type: cashForm.type,
        amount: Number(cashForm.amount),
      });
      setMessage('Cash payment recorded successfully.');
      setCashForm({ bookingId: '', type: 'down_payment', amount: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record cash payment');
    }
  };

  const pending = payments.filter((p) => p.status === 'pending');

  const columns = [
    {
      title: 'Booking Ref',
      dataIndex: ['booking', 'bookingRef'],
      key: 'bookingRef',
      render: (text) => (
        <span style={{ fontWeight: 600, color: '#3A4D39' }}>#{text || 'N/A'}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <span style={{ textTransform: 'capitalize', color: '#6E5A48', fontWeight: 500 }}>
          {text?.replace('_', ' ')}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <strong style={{ color: '#3A4D39' }}>₱{amount?.toLocaleString()}</strong>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (text) => (
        <Tag style={{ background: '#FAFAF8', borderColor: '#C4BBAF', color: '#6E5A48' }}>
          {text?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = statusConfigs[status] || { color: '#333333', bg: '#C4BBAF20', label: status };
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
            Payment Management
          </h1>
          <p style={{ color: '#6E5A48', fontSize: '0.95rem', margin: 0 }}>
            Verify online transfers and process on-site cash payments
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <Alert message={message} type="success" showIcon style={{ marginBottom: 20 }} closable />
        )}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} closable />
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ color: '#6E5A48', marginTop: 12 }}>Loading payments data...</p>
          </div>
        )}

        {!loading && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Pending Verification Section */}
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.5rem',
                  color: '#3A4D39',
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
                    border: '1px dashed #C4BBAF',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6E5A48',
                  }}
                >
                  No pending payments require verification.
                </div>
              ) : (
                <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                  {pending.map((p) => (
                    <Card
                      key={p._id}
                      bordered={false}
                      style={{
                        background: 'rgba(250, 250, 248, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        border: '1px solid #E2DCD5',
                        boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                      }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={14}>
                          <div style={{ marginBottom: '8px' }}>
                            <Tag style={{ background: '#3A4D3920', color: '#3A4D39', borderColor: '#3A4D39', fontWeight: 600 }}>
                              {p.type?.replace('_', ' ').toUpperCase()}
                            </Tag>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3A4D39', marginLeft: 8 }}>
                              ₱{p.amount?.toLocaleString()}
                            </span>
                            <span style={{ color: '#8A7A68', marginLeft: 8 }}>({p.method})</span>
                          </div>

                          <div style={{ color: '#6E5A48', fontSize: '0.875rem' }}>
                            <span style={{ marginRight: 16 }}>
                              <BarcodeOutlined /> Booking: <strong>#{p.booking?.bookingRef}</strong>
                            </span>
                            <span>
                              <UserOutlined /> Guest: <strong>{p.user?.firstName} {p.user?.lastName}</strong>
                            </span>
                          </div>

                          {p.referenceNo && (
                            <div style={{ color: '#8A7A68', fontSize: '0.825rem', marginTop: 4 }}>
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
                                  style={{ borderColor: '#8A7A68', color: '#6E5A48', background: '#FAFAF8' }}
                                >
                                  Proof
                                </Button>
                              </a>
                            )}
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                              onClick={() => verify(p._id)}
                            >
                              Verify
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              style={{ background: '#FAFAF8', borderColor: '#333333', color: '#333333' }}
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

            <Divider style={{ borderColor: '#E2DCD5', margin: '12px 0' }} />

            {/* Record Cash Payment Section */}
            <Card
              title={
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#3A4D39', fontSize: '1.25rem' }}>
                  <PlusCircleOutlined style={{ marginRight: 8 }} /> Record Cash Payment
                </span>
              }
              bordered={false}
              style={{
                background: 'rgba(250, 250, 248, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid #E2DCD5',
                boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Form layout="vertical" onFinish={submitCash}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span style={{ color: '#333333', fontWeight: 500 }}>Select Booking</span>} required>
                      <Select
                        placeholder="— Select booking —"
                        value={cashForm.bookingId || undefined}
                        onChange={(val) => setCashForm({ ...cashForm, bookingId: val })}
                        style={{ width: '100%' }}
                        options={bookings.map((b) => ({
                          value: b._id,
                          label: `#${b.bookingRef} — ${b.user?.firstName || ''} ${b.user?.lastName || ''}`,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label={<span style={{ color: '#333333', fontWeight: 500 }}>Payment Type</span>}>
                      <Select
                        value={cashForm.type}
                        onChange={(val) => setCashForm({ ...cashForm, type: val })}
                        options={[
                          { value: 'down_payment', label: 'Down Payment' },
                          { value: 'balance', label: 'Balance' },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label={<span style={{ color: '#333333', fontWeight: 500 }}>Amount</span>} required>
                      <InputNumber
                        prefix="₱"
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        value={cashForm.amount}
                        onChange={(val) => setCashForm({ ...cashForm, amount: val })}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<DollarOutlined />}
                  style={{ background: '#3A4D39', borderColor: '#3A4D39', marginTop: 8 }}
                >
                  Record Cash Payment
                </Button>
              </Form>
            </Card>

            <Divider style={{ borderColor: '#E2DCD5', margin: '12px 0' }} />

            {/* All Payments Table Section */}
            <Card
              title={
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#3A4D39', fontSize: '1.25rem' }}>
                  All Transactions ({payments.length})
                </span>
              }
              bordered={false}
              style={{
                background: 'rgba(250, 250, 248, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid #E2DCD5',
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
        )}
      </div>

      {/* Rejection Reason Modal */}
      <Modal
        title="Reject Payment"
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalOpen(false)}
        okText="Confirm Rejection"
        okButtonProps={{ style: { background: '#6E5A48', borderColor: '#6E5A48' } }}
      >
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#333333' }}>
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