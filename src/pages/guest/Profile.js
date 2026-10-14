import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.put('/users/me', form);
      // update auth context with new user info
      login(res.data, token);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>My Profile</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>{user?.email}</p>

      <form onSubmit={handleSubmit}>
        <p>
          <label><strong>First Name</strong></label><br />
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>
        <p>
          <label><strong>Last Name</strong></label><br />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>
        <p>
          <label><strong>Phone</strong></label><br />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>
        <p>
          <label><strong>Address</strong></label><br />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <p style={{ textAlign: 'center' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Profile;