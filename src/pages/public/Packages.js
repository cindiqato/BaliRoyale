import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/packages')
      .then((res) => setPackages(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load packages'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '0 20px' }}>
      <h1>Our Packages</h1>
      <p style={{ color: '#666' }}>Choose from our exclusive resort packages</p>

      {packages.length === 0 ? (
        <p style={{ marginTop: '30px' }}>No packages available yet.</p>
      ) : (
        <div style={{ marginTop: '30px' }}>
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              style={{
                border: '1px solid #ddd',
                background: '#fff',
                padding: '20px',
                marginBottom: '15px',
                textAlign: 'left',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{pkg.name}</h3>
              <p style={{ color: '#666' }}>{pkg.description}</p>
              <p>
                <strong>Schedule:</strong> {pkg.startTime} – {pkg.endTime}
                {pkg.dayType && pkg.dayType !== 'Any' && ` (${pkg.dayType})`}
              </p>
              <p><strong>Base Rate:</strong> ₱{pkg.baseRate.toLocaleString()}</p>
              <p>
                <strong>Included Pax:</strong> {pkg.includedPax} •{' '}
                <strong>Max Pax:</strong> {pkg.maxPax}
              </p>
              <p>
                <Link to={`/packages/${pkg._id}`}>View Details →</Link>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Packages;