import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auditlogs')
      .then((res) => setLogs(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Audit Logs</h1>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && logs.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No audit log entries.</p>
      )}

      {logs.map((l) => (
        <div key={l._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '12px', marginBottom: '8px' }}>
          <p style={{ margin: '0 0 3px 0' }}>
            <strong>{l.action}</strong> — {l.targetModel || 'N/A'}
          </p>
          <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#555' }}>
            {l.details}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            By {l.actor?.firstName} {l.actor?.lastName} ({l.actor?.role}) — {new Date(l.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminAuditLogs;