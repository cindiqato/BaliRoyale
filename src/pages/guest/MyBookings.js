import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Button, Card, Spin, Alert, Row, Col, Space, Empty } from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  EyeOutlined,
  HomeOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
 
const statusConfigs = {
  pending: { color: '#8A7A68', bg: '#C4BBAF20', label: 'Pending' },
  confirmed: { color: '#4F6F52', bg: '#4F6F5220', label: 'Confirmed' },
  checked_in: { color: '#3A4D39', bg: '#3A4D3920', label: 'Checked In' },
  completed: { color: '#6E5A48', bg: '#6E5A4820', label: 'Completed' },
  cancelled: { color: '#8A7A68', bg: '#8A7A6820', label: 'Cancelled' },
  no_show: { color: '#333333', bg: '#33333320', label: 'No Show' },
};
 
const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => {
    api.get('/bookings/mine')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);
 
  return (
<div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F1EA',
        color: '#333333',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        padding: '40px 20px',
      }}
>
<div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
<div style={{ textAlign: 'center', marginBottom: '32px' }}>
<h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#3A4D39',
              letterSpacing: '0.05em',
              margin: '0 0 8px 0',
            }}
>
            My Bookings
</h1>
<p style={{ color: '#6E5A48', fontSize: '0.95rem', margin: '0 0 18px 0' }}>
            View and manage your current stay reservations
</p>
 
          <Link to="/guest/book">
<Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{
                background: '#3A4D39',
                borderColor: '#3A4D39',
                borderRadius: '10px',
                fontWeight: 600,
              }}
>
              Create New Booking
</Button>
</Link>
</div>
 
        {/* Feedback Alert */}
        {error && (
<Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} closable />
        )}
 
        {/* Loading State */}
        {loading && (
<div style={{ textAlign: 'center', padding: '60px 0' }}>
<Spin size="large" />
<p style={{ color: '#6E5A48', marginTop: 12 }}>Retrieving your bookings...</p>
</div>
        )}
 
        {/* Empty State */}
        {!loading && bookings.length === 0 && (
<Card
            bordered={false}
            style={{
              background: 'rgba(250, 250, 248, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              border: '1px solid #E2DCD5',
              boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
              textAlign: 'center',
            }}
            bodyStyle={{ padding: '48px 24px' }}
>
<Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
<span style={{ color: '#6E5A48', fontSize: '1rem' }}>
                  You have no active or previous bookings yet.
</span>
              }
>
<Link to="/guest/book">
<Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    background: '#4F6F52',
                    borderColor: '#4F6F52',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
>
                  Create Your First Booking
</Button>
</Link>
</Empty>
</Card>
        )}
 
        {/* Booking Cards (Frosted Glass Aesthetic Matching StaffBookings) */}
        {!loading && bookings.length > 0 && (
<Space direction="vertical" size="large" style={{ width: '100%' }}>
            {bookings.map((b) => {
              const statusCfg = statusConfigs[b.status] || { color: '#333333', bg: '#C4BBAF20', label: b.status };
 
              return (
<Card
                  key={b._id}
                  bordered={false}
                  style={{
                    background: 'rgba(250, 250, 248, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid #E2DCD5',
                    boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    color: '#333333',
                  }}
                  bodyStyle={{ padding: '24px' }}
>
                  {/* Top Bar: Reference & Status */}
<div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #E2DCD5',
                      paddingBottom: '12px',
                      marginBottom: '16px',
                    }}
>
<span
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        letterSpacing: '0.05em',
                        color: '#3A4D39',
                      }}
>
                      #{b.bookingRef}
</span>
<Tag 
                      style={{ 
                        color: statusCfg.color, 
                        backgroundColor: statusCfg.bg,
                        borderColor: statusCfg.color,
                        borderRadius: '12px', 
                        padding: '2px 10px', 
                        textTransform: 'uppercase', 
                        fontWeight: 600 
                      }}
>
                      {statusCfg.label}
</Tag>
</div>
 
                  {/* Grid Content */}
<Row gutter={[24, 16]} style={{ marginBottom: '20px' }}>
<Col xs={24} sm={12} md={6}>
<div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
<UserOutlined /> Guest
</div>
<div style={{ fontWeight: 600, color: '#333333' }}>
                        {b.user?.firstName} {b.user?.lastName}
</div>
<div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>{b.user?.email}</div>
</Col>
 
                    <Col xs={24} sm={12} md={6}>
<div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
<HomeOutlined /> Package
</div>
<div style={{ fontWeight: 600, color: '#333333' }}>{b.package?.name}</div>
<div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>{b.guestCount} Guest(s)</div>
</Col>
 
                    <Col xs={24} sm={12} md={6}>
<div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
<CalendarOutlined /> Schedule
</div>
<div style={{ fontWeight: 600, color: '#333333' }}>
                        {new Date(b.bookingDate).toDateString()}
</div>
<div style={{ color: '#6E5A48', fontSize: '0.85rem' }}>
                        {b.startTime} – {b.endTime}
</div>
</Col>
 
                    <Col xs={24} sm={12} md={6}>
<div style={{ color: '#8A7A68', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
<DollarOutlined /> Payment & Deposit
</div>
<div style={{ fontWeight: 700, color: '#3A4D39' }}>
                        ₱{b.pricing?.totalAmount?.toLocaleString()}
</div>
<div style={{ color: '#6E5A48', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        Pay: {b.paymentStatus} | Dep: {b.depositStatus}
</div>
</Col>
</Row>
 
                  {/* Actions */}
<div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      paddingTop: '16px',
                      borderTop: '1px solid #E2DCD5',
                    }}
>
<Link to={`/guest/bookings/${b._id}`}>
<Button 
                        type="default" 
                        icon={<EyeOutlined />} 
                        style={{ borderColor: '#8A7A68', color: '#6E5A48', background: '#FAFAF8' }}
>
                        View Details
</Button>
</Link>
</div>
</Card>
              );
            })}
</Space>
        )}
</div>
</div>
  );
};
 
export default MyBookings;