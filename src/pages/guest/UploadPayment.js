import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Typography, 
  Space, 
  Divider, 
  Table, 
  Tag, 
  Alert, 
  Spin 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UploadOutlined, 
  InboxOutlined, 
  CreditCardOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function UploadPayment() {
  const { id } = useParams();

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

  useEffect(() => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get(`/payments/booking/${id}`)
    ])
      .then(([bookingRes, paymentsRes]) => {
        setBooking(bookingRes.data);
        setPayments(paymentsRes.data);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load booking details'))
      .finally(() => setLoading(false));
  }, [id]);

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
      
      const res = await api.get(`/payments/booking/${id}`);
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'verified':
      case 'CONFIRMED':
        return <Tag style={{ background: '#4F6F52', color: '#FAFAF8', border: 'none' }}>VERIFIED</Tag>;
      case 'pending':
        return <Tag style={{ background: '#8A7A68', color: '#FAFAF8', border: 'none' }}>PENDING</Tag>;
      case 'rejected':
        return <Tag color="error">REJECTED</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const paymentColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => t.replace('_', ' ').toUpperCase() },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amt) => <span style={{ color: '#3A4D39', fontWeight: 'bold' }}>₱{amt?.toLocaleString()}</span> },
    { title: 'Method', dataIndex: 'method', key: 'method', render: (m) => m.toUpperCase() },
    { title: 'Ref No.', dataIndex: 'referenceNo', key: 'referenceNo', render: (ref) => ref || 'N/A' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => renderStatusTag(status) },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#6E5A48' }}>Loading payment portal...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '24px auto', padding: '0 16px' }}>
      <p>
        <Link to={`/guest/bookings/${id}`} style={{ color: '#4F6F52', fontWeight: '500' }}>
          <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Booking
        </Link>
      </p>

      <Card 
        title={<Title level={3} style={{ margin: 0, color: '#333' }}>Upload Payment</Title>} 
        style={{ borderRadius: '8px', background: '#F4F1EA', border: '1px solid #E2DCD5' }}
      >
        {booking && (
          <div style={{ background: '#E2DCD5', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #E2DCD5' }}>
            <Text strong style={{ color: '#333' }}>Booking {booking.bookingRef}</Text>
            <div style={{ marginTop: '4px', color: '#6E5A48' }}>
              Total: <strong style={{ color: '#3A4D39' }}>₱{booking.pricing?.totalAmount?.toLocaleString()}</strong> | 
              Down payment: <strong style={{ color: '#3A4D39' }}>₱{booking.pricing?.downPayment?.toLocaleString()}</strong> | 
              Balance: <strong style={{ color: '#3A4D39' }}>₱{booking.pricing?.balanceDue?.toLocaleString()}</strong>
            </div>
          </div>
        )}

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: '16px' }} />}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Payment Type</Text></label>
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
            <label><Text strong style={{ color: '#333' }}>Amount (₱)</Text></label>
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
            <label><Text strong style={{ color: '#333' }}>Payment Method</Text></label>
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
            <label><Text strong style={{ color: '#333' }}>Reference Number</Text></label>
            <Input
              type="text"
              value={form.referenceNo}
              onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
              placeholder="e.g., 100293848123"
              size="large"
              style={{ marginTop: '6px' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label><Text strong style={{ color: '#333' }}>Proof Image / Receipt (JPG, PNG, PDF)</Text></label>
            <div style={{ marginTop: '8px' }}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ width: '100%', padding: '8px', border: '1px solid #E2DCD5', borderRadius: '6px', background: '#FAFAF8', color: '#333' }}
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
            style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
          >
            {submitting ? 'Submitting Payment...' : 'Submit Payment'}
          </Button>
        </form>

        <Divider style={{ borderColor: '#E2DCD5' }} />

        <Title level={4} style={{ color: '#333' }}>Payment History</Title>
        <Table 
          dataSource={payments.map((p, idx) => ({ ...p, key: p._id || idx }))} 
          columns={paymentColumns} 
          pagination={false}
          size="small"
          locale={{ emptyText: <span style={{ color: '#8A7A68' }}>No payments submitted yet.</span> }}
        />
      </Card>
    </div>
  );
}