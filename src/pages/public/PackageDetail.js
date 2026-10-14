import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then((res) => setPkg(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load package'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'guest') {
      alert('Only guests can book packages.');
    } else {
      navigate(`/guest/book?packageId=${pkg._id}`);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</p>;
  if (!pkg) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <p><Link to="/packages">← Back to Packages</Link></p>

      <h1 style={{ textAlign: 'center' }}>{pkg.name}</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>{pkg.description}</p>

      <hr style={{ margin: '30px 0' }} />

      <h3>Schedule</h3>
      <p>
        <strong>Time:</strong> {pkg.startTime} – {pkg.endTime}
        {pkg.dayType && pkg.dayType !== 'Any' && ` (${pkg.dayType})`}
      </p>
      <p><strong>Type:</strong> {pkg.scheduleType || 'Any'}</p>

      <h3>Capacity & Rates</h3>
      <p><strong>Base Rate:</strong> ₱{pkg.baseRate.toLocaleString()}</p>
      <p><strong>Included Pax:</strong> {pkg.includedPax}</p>
      <p><strong>Max Pax:</strong> {pkg.maxPax}</p>
      <p><strong>Excess Pax Rate:</strong> ₱{pkg.excessPaxRate.toLocaleString()} per head</p>
      {pkg.bedrooms && <p><strong>Bedrooms:</strong> {pkg.bedrooms}</p>}

      {pkg.amenities && pkg.amenities.length > 0 && (
        <>
          <h3>Amenities</h3>
          <ul>
            {pkg.amenities.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </>
      )}

      {pkg.inclusions && pkg.inclusions.length > 0 && (
        <>
          <h3>Inclusions</h3>
          <ul>
            {pkg.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
          </ul>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleBookNow}
          style={{ padding: '10px 30px', fontSize: '16px' }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default PackageDetail;