import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusColors = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  checked_in: '#9c27b0',
  completed: '#4caf50',
  cancelled: '#f44336',
  no_show: '#607d8b',
};

const StaffBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const loadBookings = () => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const act = async (id, action, body = null) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/bookings/${id}/${action}`, body || {});
      setMessage(`Booking ${action} successful.`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>All Bookings</h1>

      <p style={{ textAlign: 'center' }}>
        Filter:{' '}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </p>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No bookings match this filter.</p>
      )}

      {filtered.map((b) => (
        <div
          key={b._id}
          style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '15px', textAlign: 'left' }}
        >
          <p style={{ margin: 0 }}>
            <strong>{b.bookingRef}</strong>
            {' — '}
            <span style={{ color: statusColors[b.status] || '#333' }}>
              {b.status.toUpperCase()}
            </span>
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Guest:</strong> {b.user?.firstName} {b.user?.lastName} ({b.user?.email})
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Package:</strong> {b.package?.name}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Date:</strong> {new Date(b.bookingDate).toDateString()} • {b.startTime} – {b.endTime}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Guests:</strong> {b.guestCount} • <strong>Total:</strong> ₱{b.pricing.totalAmount?.toLocaleString()}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Payment:</strong> {b.paymentStatus} • <strong>Deposit:</strong> {b.depositStatus}
          </p>

          <div style={{ marginTop: '10px' }}>
            <Link to={`/staff/bookings/${b._id}`}>
              <button style={{ marginRight: '8px' }}>View</button>
            </Link>
            {b.status === 'pending' && (
              <button onClick={() => act(b._id, 'confirm')} style={{ marginRight: '8px' }}>
                Confirm
              </button>
            )}
            {b.status === 'confirmed' && (
              <>
                <button onClick={() => act(b._id, 'checkin')} style={{ marginRight: '8px' }}>
                  Check In
                </button>
                <button onClick={() => act(b._id, 'noshow')} style={{ marginRight: '8px' }}>
                  No Show
                </button>
              </>
            )}
            {b.status === 'checked_in' && (
              <button onClick={() => act(b._id, 'complete')} style={{ marginRight: '8px' }}>
                Complete
              </button>
            )}
            {b.status === 'completed' && b.depositStatus === 'held' && (
              <>
                <button onClick={() => act(b._id, 'deposit-return')} style={{ marginRight: '8px' }}>
                  Return Deposit
                </button>
                <button
                  onClick={() => {
                    const amount = prompt('Deduction amount (₱):');
                    if (!amount) return;
                    const reason = prompt('Reason:');
                    if (!reason) return;
                    act(b._id, 'deposit-deduct', { amount: Number(amount), reason });
                  }}
                >
                  Deduct Deposit
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffBookings;