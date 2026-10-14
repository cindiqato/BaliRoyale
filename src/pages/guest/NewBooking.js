import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const NewBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('packageId') || '';

  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    packageId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    guestCount: 1,
    specialRequests: '',
  });

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load packages, then apply preselectedId if valid
  useEffect(() => {
    api.get('/packages').then((res) => {
      setPackages(res.data);

      const match = preselectedId
        ? res.data.find((p) => p._id === preselectedId)
        : null;

      const initial = match || res.data[0];

      if (initial) {
        setForm((f) => ({
          ...f,
          packageId: initial._id,
          startTime: initial.startTime,
          endTime: initial.endTime,
        }));
        setSelectedPkg(initial);
      }
    });
  }, [preselectedId]);

  // Update selectedPkg + times when packageId changes
  useEffect(() => {
    if (!form.packageId) return;
    const pkg = packages.find((p) => p._id === form.packageId);
    setSelectedPkg(pkg || null);
    if (pkg) {
      setForm((f) => ({
        ...f,
        startTime: pkg.startTime,
        endTime: pkg.endTime,
      }));
    }
    setAvailability(null);
  }, [form.packageId, packages]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAvailability(null);
    setError('');
    setMessage('');
  };

  const calculatePricing = () => {
    if (!selectedPkg) return null;
    const baseRate = selectedPkg.baseRate;
    const excessGuests = Math.max(0, form.guestCount - selectedPkg.includedPax);
    const excessPaxFee = excessGuests * selectedPkg.excessPaxRate;
    const securityDeposit = 3000;
    const totalAmount = baseRate + excessPaxFee + securityDeposit;
    const downPayment = Math.round(totalAmount * 0.5);
    const balanceDue = totalAmount - downPayment;
    return { baseRate, excessPaxFee, securityDeposit, totalAmount, downPayment, balanceDue };
  };

  const pricing = calculatePricing();

  const checkAvailability = async () => {
    setAvailability(null);
    setError('');

    if (!form.packageId) {
      setError('Please select a package first');
      return;
    }
    if (!form.bookingDate) {
      setError('Please pick a booking date first');
      return;
    }

    setChecking(true);
    try {
      const normalizedDate = form.bookingDate.slice(0, 10);

      const res = await api.post('/bookings/check-availability', {
        packageId: form.packageId,
        bookingDate: normalizedDate,
        startTime: form.startTime,
      });
      setAvailability(res.data.available);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const normalizedDate = form.bookingDate.slice(0, 10);

      const res = await api.post('/bookings', {
        packageId: form.packageId,
        bookingDate: normalizedDate,
        startTime: form.startTime,
        endTime: form.endTime,
        guestCount: Number(form.guestCount),
        specialRequests: form.specialRequests,
      });
      setMessage('Booking created! Redirecting...');
      setTimeout(() => navigate(`/guest/bookings/${res.data.booking._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>New Booking</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <label><strong>Package</strong></label><br />
          <select
            name="packageId"
            value={form.packageId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">— Select package —</option>
            {packages.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — ₱{p.baseRate.toLocaleString()}
              </option>
            ))}
          </select>
        </p>

        <p>
          <label><strong>Booking Date</strong></label><br />
          <input
            type="date"
            name="bookingDate"
            value={form.bookingDate}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        <p>
          <label><strong>Guest Count</strong></label><br />
          <input
            type="number"
            name="guestCount"
            min="1"
            value={form.guestCount}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        {selectedPkg && (
          <p style={{ color: '#666', fontSize: '14px' }}>
            Schedule: {selectedPkg.startTime} – {selectedPkg.endTime} <br />
            Max pax: {selectedPkg.maxPax}
          </p>
        )}

        <p>
          <label><strong>Special Requests (optional)</strong></label><br />
          <textarea
            name="specialRequests"
            value={form.specialRequests}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
        </p>

        {selectedPkg && form.bookingDate && (
          <p>
            <button
              type="button"
              onClick={checkAvailability}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
            {availability === true && (
              <span style={{ color: 'green', marginLeft: '10px' }}>
                ✅ Available
              </span>
            )}
            {availability === false && (
              <span style={{ color: 'red', marginLeft: '10px' }}>
                ❌ Not available
              </span>
            )}
          </p>
        )}

        {pricing && (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', marginTop: '10px' }}>
            <h3 style={{ marginTop: 0 }}>Pricing Preview</h3>
            <p>Base Rate: ₱{pricing.baseRate.toLocaleString()}</p>
            <p>Excess Pax Fee: ₱{pricing.excessPaxFee.toLocaleString()}</p>
            <p>Security Deposit: ₱{pricing.securityDeposit.toLocaleString()}</p>
            <p><strong>Total Amount: ₱{pricing.totalAmount.toLocaleString()}</strong></p>
            <p>Down Payment (50%): ₱{pricing.downPayment.toLocaleString()}</p>
            <p>Balance Due: ₱{pricing.balanceDue.toLocaleString()}</p>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="submit" disabled={submitting || !selectedPkg}>
            {submitting ? 'Creating...' : 'Create Booking'}
          </button>
        </p>
      </form>

      <p style={{ textAlign: 'center' }}>
        <Link to="/guest">← Back to Dashboard</Link>
      </p>
    </div>
  );
};

export default NewBooking;