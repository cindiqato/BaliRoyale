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
    <nav style={{ padding: '10px', background: '#fff', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
      <Link to="/">Bali Royale</Link>
      {' | '}
      <Link to="/packages">Packages</Link>

      {user ? (
        <>
          {' | '}
          {user.role === 'admin' && <Link to="/admin">Dashboard</Link>}
          {user.role === 'staff' && <Link to="/staff">Dashboard</Link>}
          {user.role === 'guest' && <Link to="/guest">Dashboard</Link>}
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