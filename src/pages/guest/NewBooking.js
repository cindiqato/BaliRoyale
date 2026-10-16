import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Card,
  Select,
  Input,
  Button,
  Typography,
  Alert,
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
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
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load packages')
      );
  }, [preselectedId]);

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
    const excessGuests = Math.max(
      0,
      form.guestCount - selectedPkg.includedPax
    );
    const excessPaxFee = excessGuests * selectedPkg.excessPaxRate;
    const securityDeposit = 3000;
    const totalAmount = baseRate + excessPaxFee + securityDeposit;
    const downPayment = Math.round(totalAmount * 0.5);
    const balanceDue = totalAmount - downPayment;
    return {
      baseRate,
      excessPaxFee,
      securityDeposit,
      totalAmount,
      downPayment,
      balanceDue,
    };
  };

  const pricing = calculatePricing();
  const guestCountValid =
    selectedPkg && Number(form.guestCount) <= selectedPkg.maxPax;

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

      const bookingId = res.data.booking._id;
      navigate(`/guest/payments/${bookingId}?new=1`);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          err.response.data.error ||
            'This slot is currently held by another guest. Please try again later.'
        );
      } else {
        setError(err.response?.data?.error || 'Failed to create booking');
      }
    } finally {
      setSubmitting(false);
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
      <div
        style={{ maxWidth: '700px', margin: '24px auto', padding: '0 16px' }}
      >
        <p>
          <Link to="/guest" style={{ color: C.medium, fontWeight: 500 }}>
            <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to
            Dashboard
          </Link>
        </p>

        <Card
          title={
            <Title level={3} style={{ margin: 0, color: C.green }}>
              New Booking
            </Title>
          }
          style={{
            borderRadius: '12px',
            background: C.white,
            border: `1px solid ${C.border}`,
          }}
        >
          <Alert
            message={
              <span>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                <strong>Heads up:</strong> once you submit, your selected date
                is held for 15 minutes. Upload your down payment within that
                window to secure the slot.
              </span>
            }
            type="info"
            showIcon={false}
            style={{
              marginBottom: 20,
              background: '#E8EFE5',
              border: `1px solid ${C.medium}`,
              borderRadius: 8,
            }}
          />

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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Package
                </Text>
              </label>
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

            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Booking Date
                </Text>
              </label>
              <Input
                type="date"
                value={form.bookingDate}
                onChange={(e) => handleChange('bookingDate', e.target.value)}
                required
                size="large"
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Guest Count
                </Text>
              </label>
              <Input
                type="number"
                min="1"
                max={selectedPkg?.maxPax || undefined}
                value={form.guestCount}
                onChange={(e) => handleChange('guestCount', e.target.value)}
                required
                size="large"
                style={{ width: '100%', marginTop: '6px' }}
              />
              {selectedPkg && !guestCountValid && (
                <Text style={{ color: '#A13E3E', fontSize: 12 }}>
                  Guest count exceeds package maximum of {selectedPkg.maxPax}.
                </Text>
              )}
            </div>

            {selectedPkg && (
              <div
                style={{
                  background: C.cream,
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  border: `1px solid ${C.border}`,
                }}
              >
                <Text style={{ color: C.gray, display: 'block' }}>
                  <CalendarOutlined
                    style={{ marginRight: '6px', color: C.medium }}
                  />
                  <strong>Schedule:</strong> {selectedPkg.startTime} –{' '}
                  {selectedPkg.endTime}
                </Text>
                <Text
                  style={{
                    color: C.gray,
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  <strong>Max Pax Allowed:</strong> {selectedPkg.maxPax}{' '}
                  (Included: {selectedPkg.includedPax})
                </Text>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label>
                <Text strong style={{ color: '#333' }}>
                  Special Requests (optional)
                </Text>
              </label>
              <TextArea
                rows={3}
                value={form.specialRequests}
                onChange={(e) =>
                  handleChange('specialRequests', e.target.value)
                }
                placeholder="Enter any additional requests or preferences..."
                style={{ marginTop: '6px' }}
              />
            </div>

            {selectedPkg && form.bookingDate && (
              <div
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <Button
                  onClick={checkAvailability}
                  loading={checking}
                  style={{ borderColor: C.border, color: '#333' }}
                >
                  {checking ? 'Checking...' : 'Check Availability'}
                </Button>

                {availability === true && (
                  <span style={{ color: C.medium, fontWeight: 'bold' }}>
                    <CheckCircleOutlined /> Available
                  </span>
                )}
                {availability === false && (
                  <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    <CloseCircleOutlined /> Not available
                  </span>
                )}
              </div>
            )}

            {pricing && guestCountValid && (
              <div
                style={{
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                }}
              >
                <Title level={5} style={{ marginTop: 0, color: C.green }}>
                  <DollarOutlined style={{ color: C.green }} /> Pricing Preview
                </Title>
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ color: C.gray }}
                >
                  <Descriptions.Item label="Base Rate">
                    ₱{pricing.baseRate.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Excess Pax Fee">
                    ₱{pricing.excessPaxFee.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Security Deposit">
                    ₱{pricing.securityDeposit.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Text strong style={{ color: '#333' }}>
                        Total Amount
                      </Text>
                    }
                  >
                    <Text strong style={{ color: C.green, fontSize: '15px' }}>
                      ₱{pricing.totalAmount.toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Down Payment (50%)">
                    ₱{pricing.downPayment.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Balance Due">
                    ₱{pricing.balanceDue.toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              disabled={submitting || !selectedPkg || !guestCountValid}
              loading={submitting}
              style={{
                background: C.green,
                borderColor: C.green,
                color: '#FAFAF8',
                height: 46,
                fontWeight: 600,
              }}
            >
              {submitting
                ? 'Reserving slot...'
                : 'Create Booking & Pay Down Payment'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}