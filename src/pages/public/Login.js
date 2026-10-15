import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '85vh', 
      backgroundColor: '#F4F1EA' // Soft earthy cream background
    }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%', 
        margin: '20px', 
        padding: '36px', 
        textAlign: 'center', 
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(110, 90, 72, 0.1)', // Dirty brown tinted shadow
        border: '1px solid #E2DCD5'
      }}>
        <h2 style={{ color: '#3A4D39', marginBottom: '24px', fontWeight: '700', fontSize: '24px' }}>
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '6px', 
                border: '1px solid #C4BBAF', // Dirty brown / taupe border
                outline: 'none',
                fontSize: '14px',
                backgroundColor: '#FAFAF8',
                color: '#333',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '6px', 
                border: '1px solid #C4BBAF', 
                outline: 'none',
                fontSize: '14px',
                backgroundColor: '#FAFAF8',
                color: '#333',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#A94442', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
              {error}
            </p>
          )}

          <div style={{ marginBottom: '20px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: 'none', 
                backgroundColor: '#4F6F52', // Deep forest green
                color: '#FFFFFF', 
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginTop: '16px' }}>
          <Link to="/forgot-password" style={{ color: '#8A7A68', textDecoration: 'none' }}>
            Forgot password?
          </Link>
          <p style={{ margin: 0, color: '#6E5A48' }}>
            No account yet? <Link to="/register" style={{ color: '#4F6F52', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;