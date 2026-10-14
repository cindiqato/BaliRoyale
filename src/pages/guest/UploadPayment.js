import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const UploadPayment = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    type: 'down_payment',
    amount: '',
    method: 'gcash',
    referenceNo: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${id}`).then((res) => setBooking(res.data));
    api.get(`/payments/booking/${id}`).then((res) => setPayments(res.data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('bookingId', id);
      data.append('type', form.type);
      data.append('amount', form.amount);
      data.append('method', form.method);
      data.append('referenceNo', form.referenceNo);
      if (file) data.append('proofImage', file);

      await api.post('/payments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Payment submitted! Awaiting verification.');
      setForm({ type: 'down_payment', amount: '', method: 'gcash', referenceNo: '' });
      setFile(null);
      const res = await api.get(`/payments/booking/${id}`);
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <p><Link to={`/guest/bookings/${id}`}>← Back to Booking</Link></p>
      <h1 style={{ textAlign: 'center' }}>Upload Payment</h1>

      {booking && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Booking {booking.bookingRef} — Total ₱{booking.pricing.totalAmount.toLocaleString()}
          <br />
          Down payment: ₱{booking.pricing.downPayment.toLocaleString()} • Balance: ₱{booking.pricing.balanceDue.toLocaleString()}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <p>
          <label><strong>Type</strong></label><br />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="down_payment">Down Payment</option>
            <option value="balance">Balance</option>
          </select>
        </p>

        <p>
          <label><strong>Amount</strong></label><br />
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        <p>
          <label><strong>Method</strong></label><br />
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="gcash">GCash</option>
            <option value="maya">Maya</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </p>

        <p>
          <label><strong>Reference Number</strong></label><br />
          <input
            type="text"
            value={form.referenceNo}
            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        <p>
          <label><strong>Proof Image (JPG, PNG, PDF)</strong></label><br />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <p style={{ textAlign: 'center' }}>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </p>
      </form>

      <h3>Payment History</h3>
      {payments.length === 0 ? (
        <p style={{ color: '#666' }}>No payments submitted yet.</p>
      ) : (
        <ul>
          {payments.map((p) => (
            <li key={p._id}>
              {p.type} — ₱{p.amount.toLocaleString()} — {p.method} — <strong>{p.status}</strong>
              {p.referenceNo && ` — Ref: ${p.referenceNo}`}
              {p.rejectionReason && ` — Reason: ${p.rejectionReason}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadPayment;