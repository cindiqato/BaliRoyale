import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  Row, 
  Col, 
  Space 
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  UserAddOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/register', form);
      setSuccess('Registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>
      <Card 
        style={{ 
          borderRadius: '10px', 
          background: '#FAFAF8', 
          border: '1px solid #E2DCD5',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          padding: '12px 8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#333', marginBottom: '4px' }}>
            Create an Account
          </Title>
          <Paragraph style={{ color: '#6E5A48', margin: 0 }}>
            Join us to browse packages and manage your resort bookings
          </Paragraph>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: '20px' }} />}

        <form onSubmit={handleSubmit}>
          {/* First Name & Last Name */}
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '16px' }}>
                <label><Text strong style={{ color: '#333' }}>First Name</Text></label>
                <Input
                  prefix={<UserOutlined style={{ color: '#8A7A68' }} />}
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  size="large"
                  style={{ marginTop: '6px', borderRadius: '6px' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '16px' }}>
                <label><Text strong style={{ color: '#333' }}>Last Name</Text></label>
                <Input
                  prefix={<UserOutlined style={{ color: '#8A7A68' }} />}
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  size="large"
                  style={{ marginTop: '6px', borderRadius: '6px' }}
                />
              </div>
            </Col>
          </Row>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Email Address</Text></label>
            <Input
              prefix={<MailOutlined style={{ color: '#8A7A68' }} />}
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              size="large"
              style={{ marginTop: '6px', borderRadius: '6px' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Password</Text></label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8A7A68' }} />}
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              size="large"
              style={{ marginTop: '6px', borderRadius: '6px' }}
            />
          </div>

          {/* Phone (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label><Text strong style={{ color: '#333' }}>Phone Number <Text type="secondary" style={{ fontWeight: 'normal' }}>(optional)</Text></Text></label>
            <Input
              prefix={<PhoneOutlined style={{ color: '#8A7A68' }} />}
              type="text"
              name="phone"
              placeholder="+63 9XX XXX XXXX"
              value={form.phone}
              onChange={handleChange}
              size="large"
              style={{ marginTop: '6px', borderRadius: '6px' }}
            />
          </div>

          {/* Address (Optional) */}
          <div style={{ marginBottom: '24px' }}>
            <label><Text strong style={{ color: '#333' }}>Address <Text type="secondary" style={{ fontWeight: 'normal' }}>(optional)</Text></Text></label>
            <Input
              prefix={<HomeOutlined style={{ color: '#8A7A68' }} />}
              type="text"
              name="address"
              placeholder="City, Province, or Address"
              value={form.address}
              onChange={handleChange}
              size="large"
              style={{ marginTop: '6px', borderRadius: '6px' }}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block 
            loading={loading}
            icon={<UserAddOutlined />}
            style={{ 
              background: '#3A4D39', 
              borderColor: '#3A4D39', 
              color: '#FAFAF8',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Registering...' : 'Register Account'}
          </Button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text style={{ color: '#6E5A48' }}>
            Already have an account? {' '}
            <Link to="/login" style={{ color: '#4F6F52', fontWeight: 'bold' }}>
              Login here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}