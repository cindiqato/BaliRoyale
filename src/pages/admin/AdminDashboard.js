import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center', padding: '0 20px' }}>
      <h1>Welcome, {user?.firstName}!</h1>
      <p style={{ color: '#666' }}>Admin overview of the system.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'inline-block', textAlign: 'left', marginTop: '20px', background: '#fff', padding: '20px', border: '1px solid #ddd' }}>
          <p><strong>Total Users:</strong> {stats.totalUsers}</p>
          <p><strong>Guests:</strong> {stats.totalGuests}</p>
          <p><strong>Staff:</strong> {stats.totalStaff}</p>
          <p><strong>Packages:</strong> {stats.totalPackages}</p>
          <p><strong>Bookings:</strong> {stats.totalBookings}</p>
          <p><strong>Archived Records:</strong> {stats.totalArchived}</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link to="/admin/users"><button style={{ margin: '5px' }}>Manage Users</button></Link>
        <Link to="/admin/packages"><button style={{ margin: '5px' }}>Manage Packages</button></Link>
        <Link to="/admin/archives"><button style={{ margin: '5px' }}>Archives</button></Link>
        <Link to="/admin/auditlogs"><button style={{ margin: '5px' }}>Audit Logs</button></Link>
      </div>
    </div>
  );
};

export default AdminDashboard;