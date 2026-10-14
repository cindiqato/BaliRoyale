import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminArchives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadArchives = () => {
    api.get('/archives')
      .then((res) => setArchives(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load archives'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const restore = async (id) => {
    if (!window.confirm('Restore this record?')) return;
    setError('');
    setMessage('');
    try {
      await api.put(`/archives/${id}/restore`);
      setMessage('Record restored.');
      loadArchives();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to restore');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Archived Records</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {!loading && archives.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No archived records.</p>
      )}

      {archives.map((a) => (
        <div key={a._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 5px 0' }}>
            <strong>{a.originalModel}</strong> — {a.snapshot?.bookingRef || a.snapshot?.email || a.snapshot?.name || a.originalId}
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
            Reason: {a.reason || 'N/A'} • Archived by: {a.archivedBy?.firstName} {a.archivedBy?.lastName}
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#888' }}>
            Archived on: {new Date(a.createdAt).toLocaleString()}
            {a.isRestored && ' — RESTORED'}
          </p>
          {!a.isRestored && (
            <button onClick={() => restore(a._id)}>Restore</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminArchives;