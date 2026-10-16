import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Input, Button, Alert, Form } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  cream: '#F4F1EA',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
  border: '#C4BBAF',
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', form);
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/guest');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: C.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
              Welcome
            </h2>
            <p style={{ color: C.brown, fontSize: '0.9rem', margin: 0 }}>
              Sign in to your Bali Royale account.
            </p>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 20, textAlign: 'left' }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item required style={{ marginBottom: 16 }}>
              <Input
                size="large"
                type="email"
                prefix={<MailOutlined style={{ color: C.gray, marginRight: 4 }} />}
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  borderRadius: '10px',
                  borderColor: C.border,
                  background: C.white,
                }}
              />
            </Form.Item>

            <Form.Item required style={{ marginBottom: 24 }}>
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: C.gray, marginRight: 4 }} />}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              icon={!loading && <LoginOutlined />}
              style={{
                background: C.green,
                borderColor: C.green,
                borderRadius: '10px',
                fontWeight: 600,
                height: '46px',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          <div
            style={{
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: `1px solid #E2DCD5`,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: '0.9rem',
            }}
          >
            <Link
              to="/forgot-password"
              style={{ color: C.brown, fontWeight: 500 }}
            >
              Forgot password?
            </Link>
            <p style={{ margin: 0, color: C.brown }}>
              No account yet?{' '}
              <Link
                to="/register"
                style={{ color: C.medium, fontWeight: 600 }}
              >
                Register
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;