
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const colors = {
  cream: '#F4F1EA',
  green: '#3A4D39',
  lightGreen: '#4F6F52',
  pink: '#F2DCD5',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
};

const styles = {
  page: {
    minHeight: '100vh', background: colors.cream,
    padding: '45px 30px', fontFamily: 'Arial, sans-serif',
  },
  container: { maxWidth: 1100, margin: 'auto' },
  row: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 20, flexWrap: 'wrap',
  },
  title: { color: colors.green, margin: '12px 0 8px' },
  muted: { color: colors.gray, fontSize: 13 },
  count: {
    background: colors.green, color: colors.white,
    padding: '18px 28px', borderRadius: 12,
  },
  panel: {
    background: colors.white, padding: 28,
    border: '1px solid #C4BBAF', borderRadius: 16,
    marginTop: 30,
  },
  card: {
    background: colors.white, border: '1px solid #C4BBAF',
    borderRadius: 12, padding: 22, marginBottom: 14,
  },
  badge: {
    background: colors.cream, color: colors.lightGreen,
    padding: '6px 12px', borderRadius: 6, fontSize: 12,
  },
  button: {
    background: colors.lightGreen, color: colors.white,
    border: 0, padding: '11px 22px', borderRadius: 8,
    cursor: 'pointer', fontWeight: 'bold',
  },
  text: { color: colors.brown, fontSize: 13 },
};

const AdminArchives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadArchives = () => {
    api.get('/archives')
      .then(res => setArchives(res.data))
      .catch(err => setError(
        err.response?.data?.error || 'Failed to load archives'
      ))
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
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.row}>
          <div>
            <small style={{ ...styles.muted, letterSpacing: 2 }}>
              BALIROYALE / ADMINISTRATION
            </small>
            <h1 style={styles.title}>Archived Records</h1>
            <p style={styles.muted}>
              View and restore previously archived records.
            </p>
          </div>

          <div style={styles.count}>
            <small style={{ color: colors.pink }}>Archived Records</small>
            <h1 style={{ margin: '8px 0 0' }}>{archives.length}</h1>
          </div>
        </div>

        {/* ARCHIVE PANEL */}
        <div style={styles.panel}>
          <div style={{
            ...styles.row, borderBottom: `1px solid ${colors.pink}`,
            paddingBottom: 20, marginBottom: 20,
          }}>
            <div>
              <h2 style={styles.title}>Archive History</h2>
              <p style={styles.muted}>Records stored in the archive</p>
            </div>
            <span style={styles.badge}>{archives.length} Records</span>
          </div>

          {message && (
            <p style={{ ...styles.badge, color: colors.green }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ ...styles.badge, background: colors.pink, color: '#A13E3E' }}>
              {error}
            </p>
          )}

          {loading && <p style={styles.muted}>Loading...</p>}

          {!loading && archives.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <h2 style={styles.title}>▤</h2>
              <h3 style={styles.title}>No archived records</h3>
              <p style={styles.muted}>No archived records.</p>
            </div>
          )}

          {/* ARCHIVE RECORDS */}
          {archives.map(a => (
            <div key={a._id} style={{ ...styles.card, ...styles.row }}>
              <div style={{ display: 'flex', gap: 18, minWidth: 0, flex: 1 }}>
                <div style={{
                  background: colors.pink, color: colors.green,
                  padding: 14, borderRadius: 10, alignSelf: 'flex-start',
                }}>
                  ▤
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ ...styles.row, justifyContent: 'flex-start', gap: 10 }}>
                    <h3 style={{ ...styles.title, fontSize: 16, overflowWrap: 'anywhere' }}>
                      {a.snapshot?.bookingRef ||
                       a.snapshot?.email ||
                       a.snapshot?.name ||
                       a.originalId}
                    </h3>
                    <span style={styles.badge}>{a.originalModel}</span>
                  </div>

                  <p style={styles.text}>
                    <strong>Reason:</strong> {a.reason || 'N/A'}
                  </p>
                  <p style={styles.text}>
                    <strong>Archived by:</strong>{' '}
                    {a.archivedBy?.firstName} {a.archivedBy?.lastName}
                  </p>
                  <p style={styles.muted}>
                    Archived on: {new Date(a.createdAt).toLocaleString()}
                  </p>

                  {a.isRestored && (
                    <span style={{ ...styles.badge, background: colors.pink }}>
                      RESTORED
                    </span>
                  )}
                </div>
              </div>

              {!a.isRestored && (
                <button
                  style={styles.button}
                  onClick={() => restore(a._id)}
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminArchives;
