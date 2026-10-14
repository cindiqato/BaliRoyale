import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        padding: '12px',
        background: '#fff',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
      }}
    >
      <Link to="/">Bali Royale</Link>
      {' | '}
      <Link to="/packages">Packages</Link>

      {user && user.role === 'guest' && (
        <>
          {' | '}
          <Link to="/guest">Dashboard</Link>
          {' | '}
          <Link to="/guest/bookings">My Bookings</Link>
        </>
      )}

      {user && user.role === 'staff' && (
        <>
          {' | '}
          <Link to="/staff">Dashboard</Link>
          {' | '}
          <Link to="/staff/bookings">Bookings</Link>
          {' | '}
          <Link to="/staff/payments">Payments</Link>
          {' | '}
          <Link to="/staff/requests">Requests</Link>
        </>
      )}

      {user && user.role === 'admin' && (
        <>
          {' | '}
          <Link to="/admin">Dashboard</Link>
          {' | '}
          <Link to="/staff/bookings">Bookings</Link>
          {' | '}
          <Link to="/staff/payments">Payments</Link>
          {' | '}
          <Link to="/admin/users">Users</Link>
          {' | '}
          <Link to="/admin/packages">Packages</Link>
          {' | '}
          <Link to="/admin/archives">Archives</Link>
          {' | '}
          <Link to="/admin/auditlogs">Logs</Link>
        </>
      )}

      {user ? (
        <>
          {' | '}
          <Link to="/profile">Profile</Link>
          {' | '}
          <span>Hi, {user.firstName}</span>
          {' '}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          {' | '}
          <Link to="/login">Login</Link>
          {' | '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;