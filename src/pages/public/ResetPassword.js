import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Input, Button, Alert, Space, Form } from 'antd';
import { LockOutlined, ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import api from '../../api/axios';
 
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async () => {
    setMessage('');
    setError('');
 
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
 
    setLoading(true);
    try {
      await api.post('/reset-password', { token, newPassword });
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
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
              Reset Password
            </h2>
            <p style={{ color: '#6E5A48', fontSize: '0.9rem', margin: 0 }}>
              Set a new password for your account.
            </p>
          </div>
 
          {/* Feedback Alerts */}
          <Space direction="vertical" style={{ width: '100%', marginBottom: message || error ? 20 : 0 }}>
            {message && <Alert message={message} type="success" showIcon closable />}
            {error && <Alert message={error} type="error" showIcon closable />}
          </Space>
 
          {/* Form */}
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item required style={{ marginBottom: 16 }}>
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: '#8A7A68', marginRight: 4 }} />}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  borderRadius: '10px',
                  borderColor: '#C4BBAF',
                  background: '#FAFAF8',
                }}
              />
            </Form.Item>
 
            <Form.Item required style={{ marginBottom: 24 }}>
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: '#8A7A68', marginRight: 4 }} />}
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              icon={!loading && <KeyOutlined />}
              style={{
                background: '#3A4D39',
                borderColor: '#3A4D39',
                borderRadius: '10px',
                fontWeight: 600,
                height: '46px',
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
 
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
 
export default ResetPassword;