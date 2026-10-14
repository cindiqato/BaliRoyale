import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/staff')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center', padding: '0 20px' }}>
      <h1>Welcome, {user?.firstName}!</h1>
      <p style={{ color: '#666' }}>Staff overview of pending tasks.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'inline-block', textAlign: 'left', marginTop: '20px', background: '#fff', padding: '20px', border: '1px solid #ddd' }}>
          <p><strong>Pending Bookings:</strong> {stats.pendingBookings}</p>
          <p><strong>Confirmed Bookings:</strong> {stats.confirmedBookings}</p>
          <p><strong>Pending Payments:</strong> {stats.pendingPayments}</p>
          <p><strong>Cancel Requests:</strong> {stats.pendingCancelRequests}</p>
          <p><strong>Reschedule Requests:</strong> {stats.pendingRescheduleRequests}</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link to="/staff/bookings">
          <button style={{ marginRight: '10px' }}>Manage Bookings</button>
        </Link>
        <Link to="/staff/payments">
          <button style={{ marginRight: '10px' }}>Verify Payments</button>
        </Link>
        <Link to="/staff/requests">
          <button>Handle Requests</button>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboard;