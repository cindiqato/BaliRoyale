import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button, Alert, Form } from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined,
  SendOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  cream: '#F4F1EA',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
  border: '#C4BBAF',
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/forgot-password', { email });
      setMessage(
        res.data.message ||
          'If the email exists, a reset link has been sent.'
      );
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
        backgroundColor: C.cream,
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
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
            background: 'rgba(250, 250, 248, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: `1px solid #E2DCD5`,
            boxShadow: '0 8px 32px 0 rgba(58, 77, 57, 0.08)',
            textAlign: 'center',
          }}
          bodyStyle={{ padding: '36px 28px' }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '2rem',
                fontWeight: '600',
                color: C.green,
                margin: '0 0 8px 0',
                letterSpacing: '0.03em',
              }}
            >
              Forgot Password
            </h2>
            <p style={{ color: C.brown, fontSize: '0.9rem', margin: 0 }}>
              Enter your email and we'll send a reset link.
            </p>
          </div>

          {message && (
            <Alert
              message={message}
              type="success"
              showIcon
              closable
              onClose={() => setMessage('')}
              style={{ marginBottom: 20, textAlign: 'left' }}
            />
          )}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 20, textAlign: 'left' }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item required style={{ marginBottom: 24 }}>
              <Input
                size="large"
                type="email"
                prefix={
                  <MailOutlined style={{ color: C.gray, marginRight: 4 }} />
                }
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: '10px',
                  borderColor: C.border,
                  background: C.white,
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
                background: C.green,
                borderColor: C.green,
                borderRadius: '10px',
                fontWeight: 600,
                height: '46px',
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>

          <div
            style={{
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: `1px solid #E2DCD5`,
            }}
          >
            <Link
              to="/login"
              style={{
                color: C.brown,
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