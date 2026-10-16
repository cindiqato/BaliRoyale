import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  SwapOutlined,
  UserOutlined,
  TeamOutlined,
  InboxOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  gold: '#C5A46D',
  white: '#FFFFFF',
  border: '#E2DCD5',
};

const navLinkStyle = {
  color: C.green,
  fontSize: 13,
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  textDecoration: 'none',
};

const Navbar = () => {
  const { user } = useAuth();

  const handleLogout = () => {
    // Clear the session synchronously, then hard-reload to /login.
    // This bypasses any React state race and lands on a fresh login page.
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav
      style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 22,
          fontWeight: 'bold',
          letterSpacing: 2,
          color: C.green,
          textDecoration: 'none',
        }}
      >
        BALI ROYALE<span style={{ color: C.gold }}>.</span>
      </Link>

      <Space size={24} wrap style={{ justifyContent: 'center' }}>
        <Link to="/" style={navLinkStyle}>
          <HomeOutlined /> Home
        </Link>

        {(!user || user.role === 'guest') && (
          <Link to="/packages" style={navLinkStyle}>
            <AppstoreOutlined /> Packages
          </Link>
        )}

        {user && user.role === 'guest' && (
          <>
            <Link to="/guest" style={navLinkStyle}>
              <DashboardOutlined /> Dashboard
            </Link>
            <Link to="/guest/bookings" style={navLinkStyle}>
              <CalendarOutlined /> My Bookings
            </Link>
          </>
        )}

        {user && user.role === 'staff' && (
          <>
            <Link to="/staff" style={navLinkStyle}>
              <DashboardOutlined /> Dashboard
            </Link>
            <Link to="/staff/bookings" style={navLinkStyle}>
              <CalendarOutlined /> Bookings
            </Link>
            <Link to="/staff/payments" style={navLinkStyle}>
              <CreditCardOutlined /> Payments
            </Link>
            <Link to="/staff/requests" style={navLinkStyle}>
              <SwapOutlined /> Requests
            </Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <Link to="/admin" style={navLinkStyle}>
              <DashboardOutlined /> Dashboard
            </Link>
            <Link to="/staff/bookings" style={navLinkStyle}>
              <CalendarOutlined /> Bookings
            </Link>
            <Link to="/staff/payments" style={navLinkStyle}>
              <CreditCardOutlined /> Payments
            </Link>
            <Link to="/admin/users" style={navLinkStyle}>
              <TeamOutlined /> Users
            </Link>
            <Link to="/admin/packages" style={navLinkStyle}>
              <InboxOutlined /> Packages
            </Link>
            <Link to="/admin/archives" style={navLinkStyle}>
              <FileTextOutlined /> Archives
            </Link>
            <Link to="/admin/auditlogs" style={navLinkStyle}>
              <FileTextOutlined /> Logs
            </Link>
          </>
        )}
      </Space>

      <Space size={12} wrap>
        {user ? (
          <>
            <Link to="/profile" style={navLinkStyle}>
              <UserOutlined /> {user.firstName}
            </Link>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="middle"
              style={{
                background: C.green,
                borderColor: C.green,
                color: C.white,
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle}>
              Login
            </Link>
            <Link to="/register">
              <Button
                type="primary"
                size="middle"
                style={{
                  background: C.green,
                  borderColor: C.green,
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Book Now
              </Button>
            </Link>
          </>
        )}
      </Space>
    </nav>
  );
};

export default Navbar;