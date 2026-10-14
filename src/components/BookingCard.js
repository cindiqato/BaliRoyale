import { Link } from 'react-router-dom';

const statusColors = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  checked_in: '#9c27b0',
  completed: '#4caf50',
  cancelled: '#f44336',
  no_show: '#607d8b',
};

const BookingCard = ({ booking, linkPrefix = '/guest/bookings' }) => {
  return (
    <div style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '15px', textAlign: 'left' }}>
      <p style={{ margin: 0 }}>
        <strong>{booking.bookingRef}</strong>
        {' — '}
        <span style={{ color: statusColors[booking.status] || '#333' }}>
          {booking.status.toUpperCase()}
        </span>
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Package:</strong> {booking.package?.name || 'N/A'}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Date:</strong> {new Date(booking.bookingDate).toDateString()}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Guests:</strong> {booking.guestCount}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Payment:</strong> {booking.paymentStatus}
        {' • '}
        <strong>Deposit:</strong> {booking.depositStatus}
      </p>
      <p style={{ margin: '10px 0 0 0' }}>
        <Link to={`${linkPrefix}/${booking._id}`}>View Details →</Link>
      </p>
    </div>
  );
};

export default BookingCard;