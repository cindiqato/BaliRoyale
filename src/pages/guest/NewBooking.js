import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Card, 
  Form, 
  Select, 
  Input, 
  InputNumber, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Alert, 
  Spin, 
  Descriptions 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DollarOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function NewBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('packageId') || '';

  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    packageId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    guestCount: 1,
    specialRequests: '',
  });

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load packages, then apply preselectedId if valid
  useEffect(() => {
    api.get('/packages')
      .then((res) => {
        setPackages(res.data);

        const match = preselectedId
          ? res.data.find((p) => p._id === preselectedId)
          : null;

        const initial = match || res.data[0];

        if (initial) {
          setForm((f) => ({
            ...f,
            packageId: initial._id,
            startTime: initial.startTime,
            endTime: initial.endTime,
          }));
          setSelectedPkg(initial);
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load packages'))
      .finally(() => setLoading(false));
  }, [preselectedId]);

  // Update selectedPkg + times when packageId changes
  useEffect(() => {
    if (!form.packageId) return;
    const pkg = packages.find((p) => p._id === form.packageId);
    setSelectedPkg(pkg || null);
    if (pkg) {
      setForm((f) => ({
        ...f,
        startTime: pkg.startTime,
        endTime: pkg.endTime,
      }));
    }
    setAvailability(null);
  }, [form.packageId, packages]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setAvailability(null);
    setError('');
    setMessage('');
  };

  const calculatePricing = () => {
    if (!selectedPkg) return null;
    const baseRate = selectedPkg.baseRate;
    const excessGuests = Math.max(0, form.guestCount - selectedPkg.includedPax);
    const excessPaxFee = excessGuests * selectedPkg.excessPaxRate;
    const securityDeposit = 3000;
    const totalAmount = baseRate + excessPaxFee + securityDeposit;
    const downPayment = Math.round(totalAmount * 0.5);
    const balanceDue = totalAmount - downPayment;
    return { baseRate, excessPaxFee, securityDeposit, totalAmount, downPayment, balanceDue };
  };

  const pricing = calculatePricing();

  const checkAvailability = async () => {
    setAvailability(null);
    setError('');

    if (!form.packageId) {
      setError('Please select a package first');
      return;
    }
    if (!form.bookingDate) {
      setError('Please pick a booking date first');
      return;
    }

    setChecking(true);
    try {
      const normalizedDate = form.bookingDate.slice(0, 10);

      const res = await api.post('/bookings/check-availability', {
        packageId: form.packageId,
        bookingDate: normalizedDate,
        startTime: form.startTime,
      });
      setAvailability(res.data.available);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const normalizedDate = form.bookingDate.slice(0, 10);

      const res = await api.post('/bookings', {
        packageId: form.packageId,
        bookingDate: normalizedDate,
        startTime: form.startTime,
        endTime: form.endTime,
        guestCount: Number(form.guestCount),
        specialRequests: form.specialRequests,
      });
      setMessage('Booking created! Redirecting...');
      setTimeout(() => navigate(`/guest/bookings/${res.data.booking._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#6E5A48' }}>Loading booking portal...</p>
      </div>
    );
  }

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
    <div style={{ maxWidth: '700px', margin: '24px auto', padding: '0 16px' }}>
      <p>
        <Link to="/guest" style={{ color: '#4F6F52', fontWeight: '500' }}>
          <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Dashboard
        </Link>
      </p>

      <Card 
        title={<Title level={3} style={{ margin: 0, color: '#333' }}>New Booking</Title>}
        style={{ borderRadius: '8px', background: '#FAFAF8', border: '1px solid #E2DCD5' }}
      >
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: '16px' }} />}

        <form onSubmit={handleSubmit}>
          {/* Package Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Package</Text></label>
            <Select
              value={form.packageId || undefined}
              onChange={(value) => handleChange('packageId', value)}
              placeholder="— Select package —"
              style={{ width: '100%', marginTop: '6px' }}
              size="large"
            >
              {packages.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name} — ₱{p.baseRate?.toLocaleString()}
                </Option>
              ))}
            </Select>
          </div>

          {/* Booking Date */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Booking Date</Text></label>
            <Input
              type="date"
              value={form.bookingDate}
              onChange={(e) => handleChange('bookingDate', e.target.value)}
              required
              size="large"
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          {/* Guest Count */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Guest Count</Text></label>
            <Input
              type="number"
              min="1"
              value={form.guestCount}
              onChange={(e) => handleChange('guestCount', e.target.value)}
              required
              size="large"
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          {/* Package Quick Info */}
          {selectedPkg && (
            <div style={{ background: '#F4F1EA', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #E2DCD5' }}>
              <Text style={{ color: '#6E5A48', display: 'block' }}>
                <CalendarOutlined style={{ marginRight: '6px', color: '#4F6F52' }} />
                <strong>Schedule:</strong> {selectedPkg.startTime} – {selectedPkg.endTime}
              </Text>
              <Text style={{ color: '#6E5A48', display: 'block', marginTop: '4px' }}>
                <strong>Max Pax Allowed:</strong> {selectedPkg.maxPax} (Included: {selectedPkg.includedPax})
              </Text>
            </div>
          )}

          {/* Special Requests */}
          <div style={{ marginBottom: '20px' }}>
            <label><Text strong style={{ color: '#333' }}>Special Requests (optional)</Text></label>
            <TextArea
              rows={3}
              value={form.specialRequests}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
              placeholder="Enter any additional requests or preferences..."
              style={{ marginTop: '6px' }}
            />
          </div>

          {/* Availability Check Button */}
          {selectedPkg && form.bookingDate && (
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              <Button
                type="default"
                onClick={checkAvailability}
                loading={checking}
                style={{ borderColor: '#C4BBAF', color: '#333' }}
              >
                {checking ? 'Checking...' : 'Check Availability'}
              </Button>

              {availability === true && (
                <span style={{ color: '#4F6F52', marginLeft: '12px', fontWeight: 'bold' }}>
                  <CheckCircleOutlined /> Available
                </span>
              )}
              {availability === false && (
                <span style={{ color: '#ff4d4f', marginLeft: '12px', fontWeight: 'bold' }}>
                  <CloseCircleOutlined /> Not available
                </span>
              )}
            </div>
          )}

          {/* Pricing Preview Box */}
          {pricing && (
            <div style={{ background: '#F4F1EA', border: '1px solid #E2DCD5', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
              <Title level={5} style={{ marginTop: 0, color: '#333' }}>
                <DollarOutlined style={{ color: '#3A4D39' }} /> Pricing Preview
              </Title>
              <Descriptions column={1} size="small" labelStyle={{ color: '#6E5A48' }}>
                <Descriptions.Item label="Base Rate">₱{pricing.baseRate.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Excess Pax Fee">₱{pricing.excessPaxFee.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Security Deposit">₱{pricing.securityDeposit.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label={<Text strong style={{ color: '#333' }}>Total Amount</Text>}>
                  <Text strong style={{ color: '#3A4D39', fontSize: '15px' }}>₱{pricing.totalAmount.toLocaleString()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Down Payment (50%)">₱{pricing.downPayment.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Balance Due">₱{pricing.balanceDue.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block 
            disabled={submitting || !selectedPkg}
            loading={submitting}
            style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
          >
            {submitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </form>
      </Card>
    </div>
    </div>
  );
}