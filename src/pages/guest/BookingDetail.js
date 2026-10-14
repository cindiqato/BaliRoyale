import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const BookingDetail = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });

  const loadBooking = () => {
    api.get(`/bookings/${id}`)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load booking'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitCancel = async () => {
    if (!window.confirm('Request to cancel this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/cancel-request`, { reason: cancelReason });
      setActionMsg('Cancellation requested.');
      setShowCancel(false);
      setCancelReason('');
      loadBooking();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Failed to request cancel');
    }
  };

  const submitReschedule = async () => {
    if (!window.confirm('Request to reschedule this booking?')) return;
    setActionMsg('');
    setActionErr('');
    try {
      await api.put(`/bookings/${id}/reschedule-request`, rescheduleForm);
      setActionMsg('Reschedule requested.');
      setShowReschedule(false);
      setRescheduleForm({ newDate: '', newStartTime: '', newEndTime: '', reason: '' });
      loadBooking();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Failed to request reschedule');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</p>;
  if (!booking) return null;

  const canAct = ['pending', 'confirmed'].includes(booking.status);

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <p><Link to="/guest/bookings">← Back to My Bookings</Link></p>

      <h1>Booking {booking.bookingRef}</h1>
      <p><strong>Status:</strong> {booking.status}</p>
      <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
      <p><strong>Deposit Status:</strong> {booking.depositStatus}</p>

      <hr style={{ margin: '20px 0' }} />

      <h3>Package</h3>
      <p><strong>Name:</strong> {booking.package?.name}</p>
      <p><strong>Date:</strong> {new Date(booking.bookingDate).toDateString()}</p>
      <p><strong>Time:</strong> {booking.startTime} – {booking.endTime}</p>
      <p><strong>Guests:</strong> {booking.guestCount}</p>
      {booking.specialRequests && <p><strong>Special Requests:</strong> {booking.specialRequests}</p>}

      <h3>Pricing</h3>
      <p>Base Rate: ₱{booking.pricing.baseRate?.toLocaleString()}</p>
      <p>Excess Pax Fee: ₱{booking.pricing.excessPaxFee?.toLocaleString()}</p>
      <p>Security Deposit: ₱{booking.pricing.securityDeposit?.toLocaleString()}</p>
      <p><strong>Total: ₱{booking.pricing.totalAmount?.toLocaleString()}</strong></p>
      <p>Down Payment: ₱{booking.pricing.downPayment?.toLocaleString()}</p>
      <p>Balance Due: ₱{booking.pricing.balanceDue?.toLocaleString()}</p>

      <h3>Status History</h3>
      {booking.statusHistory && booking.statusHistory.length > 0 ? (
        <ul>
          {booking.statusHistory.map((h, i) => (
            <li key={i}>
              <strong>{h.status}</strong> — {new Date(h.changedAt).toLocaleString()}
              {h.remarks && ` — ${h.remarks}`}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#666' }}>No history yet.</p>
      )}

      <hr style={{ margin: '20px 0' }} />

      {actionMsg && <p style={{ color: 'green' }}>{actionMsg}</p>}
      {actionErr && <p style={{ color: 'red' }}>{actionErr}</p>}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {['pending', 'confirmed', 'checked_in'].includes(booking.status) && (
          <Link to={`/guest/payments/${booking._id}`}>
            <button style={{ marginRight: '10px' }}>Upload Payment</button>
          </Link>
        )}

        {canAct && !booking.cancelRequested && !booking.rescheduleRequested && (
          <>
            <button onClick={() => setShowCancel(true)} style={{ marginRight: '10px' }}>
              Request Cancel
            </button>
            <button onClick={() => setShowReschedule(true)}>
              Request Reschedule
            </button>
          </>
        )}

        {booking.cancelRequested && <p>⏳ Cancellation request pending</p>}
        {booking.rescheduleRequested && <p>⏳ Reschedule request pending</p>}
      </div>

      {showCancel && (
        <div style={{ border: '1px solid #ddd', padding: '15px', marginTop: '20px', background: '#fff' }}>
          <h3>Request Cancellation</h3>
          <textarea
            placeholder="Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
          <p>
            <button onClick={submitCancel} style={{ marginRight: '10px' }}>Submit</button>
            <button onClick={() => setShowCancel(false)}>Cancel</button>
          </p>
        </div>
      )}

      {showReschedule && (
        <div style={{ border: '1px solid #ddd', padding: '15px', marginTop: '20px', background: '#fff' }}>
          <h3>Request Reschedule</h3>
          <p>
            <input
              type="date"
              value={rescheduleForm.newDate}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
              style={{ padding: '8px' }}
            />
          </p>
          <p>
            <input
              type="text"
              placeholder="Start time (e.g. 9AM)"
              value={rescheduleForm.newStartTime}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <input
              type="text"
              placeholder="End time (e.g. 5PM)"
              value={rescheduleForm.newEndTime}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
              style={{ padding: '8px' }}
            />
          </p>
          <textarea
            placeholder="Reason"
            value={rescheduleForm.reason}
            onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
            rows="2"
            style={{ width: '100%', padding: '8px' }}
          />
          <p>
            <button onClick={submitReschedule} style={{ marginRight: '10px' }}>Submit</button>
            <button onClick={() => setShowReschedule(false)}>Cancel</button>
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;