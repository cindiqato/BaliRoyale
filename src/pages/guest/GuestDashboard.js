import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const GuestDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/guest')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center', padding: '0 20px' }}>
      <h1>Welcome, {user?.firstName}!</h1>
      <p style={{ color: '#666' }}>Here's a summary of your bookings.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'inline-block', textAlign: 'left', marginTop: '20px', background: '#fff', padding: '20px', border: '1px solid #ddd' }}>
          <p><strong>Total Bookings:</strong> {stats.totalBookings}</p>
          <p><strong>Pending:</strong> {stats.pending}</p>
          <p><strong>Confirmed:</strong> {stats.confirmed}</p>
          <p><strong>Completed:</strong> {stats.completed}</p>
          <p><strong>Cancelled:</strong> {stats.cancelled}</p>
          <p><strong>Total Paid:</strong> ₱{stats.totalPaid.toLocaleString()}</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link to="/packages">
          <button style={{ marginRight: '10px' }}>Browse Packages</button>
        </Link>
        <Link to="/guest/bookings">
          <button>My Bookings</button>
        </Link>
      </div>
    </div>
  );
};

export default GuestDashboard;