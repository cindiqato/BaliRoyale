import { useEffect, useState } from 'react';
import { Card, Alert, Tag, Space, Spin } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  gold: '#C5A46D',
  cream: '#F4F1EA',
  white: '#FAFAF8',
  gray: '#6E5A48',
  brown: '#8A7A68',
  border: '#C4BBAF',
  pink: '#F2DCD5',
};

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
    <div
      style={{
        minHeight: '100vh',
        background: C.cream,
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p
            style={{
              color: C.gold,
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: 4,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Bali Royale / Administration
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2.5rem',
              fontWeight: 600,
              color: C.green,
              margin: '12px 0 8px',
            }}
          >
            Audit Logs
          </h1>
          <p style={{ color: C.gray, margin: 0 }}>
            Monitor system activities and review recorded actions.
          </p>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />
        )}

        <Card
          bordered={false}
          style={{
            background: 'rgba(250, 250, 248, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
          }}
          bodyStyle={{ padding: 28 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              paddingBottom: 20,
              marginBottom: 20,
              borderBottom: `1px solid ${C.pink}`,
            }}
          >
            <div>
              <h2
                style={{
                  color: C.green,
                  fontSize: 20,
                  margin: '0 0 6px',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Activity History ({logs.length})
              </h2>
              <p style={{ color: C.gray, margin: 0, fontSize: 13 }}>
                Recorded system activities and actions
              </p>
            </div>
            <Tag
              style={{
                background: C.green,
                color: C.white,
                border: 'none',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {logs.length} Entries
            </Tag>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <FileTextOutlined style={{ fontSize: 38, color: C.medium }} />
              <h3 style={{ color: C.green, marginTop: 14 }}>
                No audit log entries
              </h3>
              <p style={{ color: C.gray }}>No audit log entries.</p>
            </div>
          )}

          {!loading &&
            logs.map((l) => (
              <Card
                key={l._id}
                bordered={false}
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      background: C.pink,
                      color: C.green,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    <FileTextOutlined />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Space wrap align="center" style={{ marginBottom: 10 }}>
                      <h3
                        style={{
                          color: C.green,
                          fontSize: 16,
                          fontWeight: 700,
                          margin: 0,
                          fontFamily: 'Georgia, serif',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {l.action}
                      </h3>
                      <Tag
                        style={{
                          background: C.cream,
                          color: C.medium,
                          border: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {l.targetModel || 'N/A'}
                      </Tag>
                    </Space>

                    <p
                      style={{
                        color: C.brown,
                        margin: '0 0 12px',
                        fontSize: 14,
                        lineHeight: 1.6,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {l.details}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                        paddingTop: 12,
                        borderTop: `1px solid ${C.pink}`,
                      }}
                    >
                      <span
                        style={{
                          color: C.brown,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        By {l.actor?.firstName} {l.actor?.lastName} (
                        {l.actor?.role})
                      </span>
                      <span style={{ color: C.gray, fontSize: 12 }}>
                        {new Date(l.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </Card>
      </div>
    </div>
  );
};

export default AdminAuditLogs;