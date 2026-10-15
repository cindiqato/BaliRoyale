
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// BALIROYALE COLORS
const C = {
  cream: '#F4F1EA',
  green: '#3A4D39',
  medium: '#4F6F52',
  pink: '#F2DCD5',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
  border: '#C4BBAF',
};

// REUSABLE INLINE STYLES
const s = {
  page: {
    minHeight: '100vh',
    background: C.cream,
    padding: '45px 30px',
    fontFamily: 'Arial, sans-serif',
    color: '#333333',
    boxSizing: 'border-box',
  },
  container: { maxWidth: 1100, margin: '0 auto' },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  title: {
    color: C.green,
    fontSize: 32,
    margin: '12px 0 8px',
  },
  muted: {
    color: C.gray,
    fontSize: 13,
    margin: 0,
  },
  count: {
    background: C.green,
    borderRadius: 12,
    padding: '18px 28px',
    minWidth: 150,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxSizing: 'border-box',
  },
  panel: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 5px 25px rgba(58,77,57,0.06)',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 18,
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 22,
  },
  icon: {
    width: 46,
    height: 46,
    background: C.pink,
    color: C.green,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 23,
    flexShrink: 0,
  },
  badge: {
    background: C.cream,
    color: C.medium,
    borderRadius: 6,
    padding: '5px 11px',
    fontSize: 11,
    fontWeight: 700,
  },
  details: {
    color: C.brown,
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 0 16px',
    overflowWrap: 'anywhere',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    borderTop: `1px solid ${C.pink}`,
  },
  empty: {
    textAlign: 'center',
    color: C.gray,
    padding: '55px 20px',
  },
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auditlogs')
      .then(res => setLogs(res.data))
      .catch(err =>
        setError(
          err.response?.data?.error || 'Failed to load logs'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* PAGE HEADER */}
        <div style={{ ...s.row, marginBottom: 32 }}>
          <div>
            <span style={{
              color: C.gray,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
            }}>
              BALIROYALE / ADMINISTRATION
            </span>

            <h1 style={s.title}>Audit Logs</h1>

            <p style={{ ...s.muted, fontSize: 14 }}>
              Monitor system activities and review recorded actions.
            </p>
          </div>

          <div style={s.count}>
            <span style={{ color: C.pink, fontSize: 12 }}>
              Total Log Entries
            </span>

            <strong style={{ color: C.white, fontSize: 30 }}>
              {logs.length}
            </strong>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={s.panel}>

          <div style={{
            ...s.row,
            gap: 16,
            paddingBottom: 22,
            marginBottom: 22,
            borderBottom: `1px solid ${C.pink}`,
          }}>
            <div>
              <h2 style={{
                color: C.green,
                fontSize: 20,
                margin: '0 0 6px',
              }}>
                Activity History
              </h2>

              <p style={s.muted}>
                Recorded system activities and actions
              </p>
            </div>

            <span style={{
              ...s.badge,
              borderRadius: 20,
              padding: '9px 15px',
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}>
              {logs.length} Entries
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <p style={s.empty}>Loading...</p>
          )}

          {/* ERROR */}
          {error && (
            <p style={{
              background: C.pink,
              color: '#A13E3E',
              padding: 14,
              borderRadius: 8,
            }}>
              {error}
            </p>
          )}

          {/* EMPTY STATE */}
          {!loading && logs.length === 0 && (
            <div style={s.empty}>
              <div style={{
                fontSize: 38,
                color: C.medium,
                marginBottom: 14,
              }}>
                ▤
              </div>

              <h3 style={{
                color: C.green,
                marginBottom: 8,
              }}>
                No audit log entries
              </h3>

              <p>No audit log entries.</p>
            </div>
          )}

          {/* AUDIT LOG CARDS */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {logs.map(l => (
              <div key={l._id} style={s.card}>

                <div style={s.icon}>▤</div>

                <div style={{ flex: 1, minWidth: 0 }}>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 12,
                  }}>
                    <h3 style={{
                      color: C.green,
                      fontSize: 16,
                      fontWeight: 700,
                      margin: 0,
                      overflowWrap: 'anywhere',
                    }}>
                      {l.action}
                    </h3>

                    <span style={s.badge}>
                      {l.targetModel || 'N/A'}
                    </span>
                  </div>

                  <p style={s.details}>
                    {l.details}
                  </p>

                  {/* LOG METADATA */}
                  <div style={s.meta}>
                    <span style={{
                      color: C.brown,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      By {l.actor?.firstName}{' '}
                      {l.actor?.lastName}{' '}
                      ({l.actor?.role})
                    </span>

                    <span style={{
                      color: C.gray,
                      fontSize: 12,
                    }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
