import { useEffect, useState } from 'react';
import api from '../../api/axios';

const StaffPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [cashForm, setCashForm] = useState({
    bookingId: '',
    type: 'down_payment',
    amount: '',
  });

  const loadData = () => {
    Promise.all([api.get('/payments'), api.get('/bookings')])
      .then(([paymentsRes, bookingsRes]) => {
        setPayments(paymentsRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const verify = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/payments/${id}/verify`);
      setMessage('Payment verified.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify');
    }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setError('');
    setMessage('');
    try {
      await api.put(`/payments/${id}/reject`, { reason });
      setMessage('Payment rejected.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject');
    }
  };

  const submitCash = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/payments/cash', {
        bookingId: cashForm.bookingId,
        type: cashForm.type,
        amount: Number(cashForm.amount),
      });
      setMessage('Cash payment recorded.');
      setCashForm({ bookingId: '', type: 'down_payment', amount: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record cash');
    }
  };

  const pending = payments.filter((p) => p.status === 'pending');

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Manage Payments</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <h3>Pending Verification ({pending.length})</h3>
      {pending.length === 0 ? (
        <p style={{ color: '#666' }}>No pending payments.</p>
      ) : (
        pending.map((p) => (
          <div key={p._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
            <p style={{ margin: '0 0 5px 0' }}>
              <strong>{p.type}</strong> — ₱{p.amount.toLocaleString()} — {p.method}
              {p.referenceNo && ` — Ref: ${p.referenceNo}`}
            </p>
            <p style={{ margin: '0 0 5px 0' }}>
              Booking: {p.booking?.bookingRef} — Guest: {p.user?.firstName} {p.user?.lastName}
            </p>
            {p.proofImage && (
              <p style={{ margin: '0 0 5px 0' }}>
                <a href={`http://localhost:8000/uploads/${p.proofImage}`} target="_blank" rel="noreferrer">
                  View Proof
                </a>
              </p>
            )}
            <button onClick={() => verify(p._id)} style={{ marginRight: '8px' }}>Verify</button>
            <button onClick={() => reject(p._id)}>Reject</button>
          </div>
        ))
      )}

      <hr style={{ margin: '30px 0' }} />

      <h3>Record Cash Payment</h3>
      <form onSubmit={submitCash}>
        <p>
          <select
            value={cashForm.bookingId}
            onChange={(e) => setCashForm({ ...cashForm, bookingId: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">— Select booking —</option>
            {bookings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.bookingRef} — {b.user?.firstName} {b.user?.lastName}
              </option>
            ))}
          </select>
        </p>
        <p>
          <select
            value={cashForm.type}
            onChange={(e) => setCashForm({ ...cashForm, type: e.target.value })}
            style={{ padding: '8px', marginRight: '10px' }}
          >
            <option value="down_payment">Down Payment</option>
            <option value="balance">Balance</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={cashForm.amount}
            onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
            required
            style={{ padding: '8px' }}
          />
        </p>
        <button type="submit">Record Cash</button>
      </form>

      <hr style={{ margin: '30px 0' }} />

      <h3>All Payments ({payments.length})</h3>
      {payments.map((p) => (
        <div key={p._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>{p.booking?.bookingRef}</strong> — {p.type} — ₱{p.amount.toLocaleString()} — {p.method} —{' '}
            <strong>{p.status}</strong>
          </p>
        </div>
      ))}
    </div>
  );
};

export default StaffPayments;