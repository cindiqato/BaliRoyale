import { useEffect, useState } from 'react';
import { Card, Button, Alert, Tag, Space } from 'antd';
import { FileTextOutlined, UndoOutlined } from '@ant-design/icons';
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

const AdminArchives = () => {
  const [archives, setArchives] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadArchives = () => {
    api.get('/archives')
      .then((res) => setArchives(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load archives')
      );
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
            Archived Records
          </h1>
          <p style={{ color: C.gray, margin: 0 }}>
            View and restore previously archived records.
          </p>
        </div>

        {message && (
          <Alert
            message={message}
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
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
                Archive History ({archives.length})
              </h2>
              <p style={{ color: C.gray, margin: 0, fontSize: 13 }}>
                Records stored in the archive
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
              {archives.length} Records
            </Tag>
          </div>

          {archives.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <FileTextOutlined style={{ fontSize: 38, color: C.medium }} />
              <h3 style={{ color: C.green, marginTop: 14 }}>
                No archived records
              </h3>
              <p style={{ color: C.gray }}>No archived records.</p>
            </div>
          )}

          {archives.map((a) => (
            <Card
              key={a._id}
              bordered={false}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                marginBottom: 14,
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    background: C.pink,
                    color: C.green,
                    padding: 14,
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
                  <Space wrap align="center" style={{ marginBottom: 8 }}>
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
                      {a.snapshot?.bookingRef ||
                        a.snapshot?.email ||
                        a.snapshot?.name ||
                        a.originalId}
                    </h3>
                    <Tag
                      style={{
                        background: C.cream,
                        color: C.medium,
                        border: 'none',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {a.originalModel}
                    </Tag>
                  </Space>

                  <p
                    style={{
                      color: C.brown,
                      margin: '0 0 4px',
                      fontSize: 13,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <strong>Reason:</strong> {a.reason || 'N/A'}
                  </p>
                  <p
                    style={{
                      color: C.brown,
                      margin: '0 0 4px',
                      fontSize: 13,
                    }}
                  >
                    <strong>Archived by:</strong> {a.archivedBy?.firstName}{' '}
                    {a.archivedBy?.lastName}
                  </p>
                  <p style={{ color: C.gray, margin: 0, fontSize: 12 }}>
                    Archived on: {new Date(a.createdAt).toLocaleString()}
                  </p>

                  {a.isRestored && (
                    <Tag
                      style={{
                        background: C.pink,
                        color: C.green,
                        border: 'none',
                        fontWeight: 600,
                        marginTop: 8,
                      }}
                    >
                      RESTORED
                    </Tag>
                  )}
                </div>

                {!a.isRestored && (
                  <Button
                    icon={<UndoOutlined />}
                    onClick={() => restore(a._id)}
                    style={{
                      background: C.medium,
                      borderColor: C.medium,
                      color: C.white,
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    Restore
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AdminArchives;