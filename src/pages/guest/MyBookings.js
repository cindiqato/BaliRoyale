import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import BookingCard from '../../components/BookingCard';

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
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>My Bookings</h1>

      <p style={{ textAlign: 'center' }}>
        <Link to="/guest/book">+ Create New Booking</Link>
      </p>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666' }}>You have no bookings yet.</p>
          <Link to="/guest/book">
            <button>+ Create Your First Booking</button>
          </Link>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {bookings.map((b) => (
          <BookingCard key={b._id} booking={b} />
        ))}
      </div>
    </div>
  );
};

export default MyBookings;