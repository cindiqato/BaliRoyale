import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button, Alert, Space, Form } from 'antd';
import { MailOutlined, ArrowLeftOutlined, KeyOutlined, SendOutlined } from '@ant-design/icons';
import api from '../../api/axios';
 
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async () => {
    setMessage('');
    setError('');
    setToken('');
    setLoading(true);
 
    try {
      const res = await api.post('/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) setToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F1EA',
        color: '#333333',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Card
          bordered={false}
          style={{
            background: 'rgba(250, 250, 248, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid #E2DCD5',
            boxShadow: '0 8px 32px 0 rgba(58, 77, 57, 0.08)',
            textAlign: 'center',
          }}
          bodyStyle={{ padding: '36px 28px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '2rem',
                fontWeight: '600',
                color: '#3A4D39',
                margin: '0 0 8px 0',
                letterSpacing: '0.03em',
              }}
            >
              Forgot Password
            </h2>
            <p style={{ color: '#6E5A48', fontSize: '0.9rem', margin: 0 }}>
              Enter your email and we'll send a reset link.
            </p>
          </div>
 
          {/* Feedback Alerts */}
          <Space direction="vertical" style={{ width: '100%', marginBottom: message || error ? 20 : 0 }}>
            {message && <Alert message={message} type="success" showIcon closable />}
            {error && <Alert message={error} type="error" showIcon closable />}
          </Space>
 
          {/* Form */}
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              required
              style={{ marginBottom: 24 }}
            >
              <Input
                size="large"
                type="email"
                prefix={<MailOutlined style={{ color: '#8A7A68', marginRight: 4 }} />}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: '10px',
                  borderColor: '#C4BBAF',
                  background: '#FAFAF8',
                }}
              />
            </Form.Item>
 
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={!loading && <SendOutlined />}
              style={{
                background: '#3A4D39',
                borderColor: '#3A4D39',
                borderRadius: '10px',
                fontWeight: 600,
                height: '46px',
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>
 
          {/* Dev Token Notice */}
          {token && (
            <div
              style={{
                background: 'rgba(226, 220, 213, 0.4)',
                border: '1px dashed #C4BBAF',
                borderRadius: '10px',
                padding: '12px',
                marginTop: '24px',
                fontSize: '0.85rem',
                color: '#6E5A48',
                wordBreak: 'break-all',
              }}
            >
              <KeyOutlined style={{ marginRight: 6, color: '#3A4D39' }} />
              <strong>Dev only — reset token:</strong>
              <div style={{ marginTop: 4, fontFamily: 'monospace', color: '#333333' }}>{token}</div>
            </div>
          )}
 
          {/* Back to Login Link */}
          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #E2DCD5' }}>
            <Link
              to="/login"
              style={{
                color: '#6E5A48',
                fontSize: '0.9rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <ArrowLeftOutlined /> Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
 
export default ForgotPassword;