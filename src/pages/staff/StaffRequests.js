import { useEffect, useState } from 'react';
import api from '../../api/axios';

const StaffRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const act = async (id, action, body = null) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/bookings/${id}/${action}`, body || {});
      setMessage(`Request ${action} successful.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    }
  };

  const approveCancel = (id) => act(id, 'cancel-approve');
  const rejectCancel = (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    act(id, 'cancel-reject', { reason });
  };
  const approveReschedule = (id) => act(id, 'reschedule-approve');
  const rejectReschedule = (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    act(id, 'reschedule-reject', { reason });
  };

  const cancelRequests = bookings.filter(
    (b) => b.cancelRequested && b.cancelStatus === 'pending'
  );
  const rescheduleRequests = bookings.filter(
    (b) => b.rescheduleRequested && b.rescheduleStatus === 'pending'
  );

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Pending Requests</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      <h3>Cancellation Requests ({cancelRequests.length})</h3>
      {cancelRequests.length === 0 ? (
        <p style={{ color: '#666' }}>No pending cancellation requests.</p>
      ) : (
        cancelRequests.map((b) => (
          <div key={b._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>{b.bookingRef}</strong> — {b.user?.firstName} {b.user?.lastName}</p>
            <p style={{ margin: '0 0 5px 0' }}>Package: {b.package?.name}</p>
            <p style={{ margin: '0 0 5px 0' }}>Reason: {b.cancelReason}</p>
            <button onClick={() => approveCancel(b._id)} style={{ marginRight: '8px' }}>Approve</button>
            <button onClick={() => rejectCancel(b._id)}>Reject</button>
          </div>
        ))
      )}

      <h3 style={{ marginTop: '30px' }}>Reschedule Requests ({rescheduleRequests.length})</h3>
      {rescheduleRequests.length === 0 ? (
        <p style={{ color: '#666' }}>No pending reschedule requests.</p>
      ) : (
        rescheduleRequests.map((b) => (
          <div key={b._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>{b.bookingRef}</strong> — {b.user?.firstName} {b.user?.lastName}</p>
            <p style={{ margin: '0 0 5px 0' }}>Current: {new Date(b.bookingDate).toDateString()} {b.startTime} – {b.endTime}</p>
            <p style={{ margin: '0 0 5px 0' }}>Requested: {new Date(b.newDate).toDateString()} {b.newStartTime} – {b.newEndTime}</p>
            <p style={{ margin: '0 0 5px 0' }}>Reason: {b.rescheduleReason}</p>
            <button onClick={() => approveReschedule(b._id)} style={{ marginRight: '8px' }}>Approve</button>
            <button onClick={() => rejectReschedule(b._id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default StaffRequests;