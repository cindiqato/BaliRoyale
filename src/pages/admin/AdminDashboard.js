import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.firstName}!</p>
      <p>(Full dashboard coming soon.)</p>
    </div>
  );
};

export default AdminDashboard;