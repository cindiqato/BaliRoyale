import { useEffect, useState } from 'react';
import { Tag, Button, Card, Spin, Alert, Row, Col, Space, Modal, Input, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ExclamationCircleOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  BarcodeOutlined,
  HomeOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const StaffRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState({ id: null, type: null }); // type: 'cancel' | 'reschedule'
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    setLoading(true);
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const act = async (id, action, body = null) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/bookings/${id}/${action}`, body || {});
      setMessage(`Request ${action} successful.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    }
  };

  const approveCancel = (id) => act(id, 'cancel-approve');
  const approveReschedule = (id) => act(id, 'reschedule-approve');

  const openRejectModal = (id, type) => {
    setRejectTarget({ id, type });
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason) return;
    const { id, type } = rejectTarget;
    if (type === 'cancel') {
      act(id, 'cancel-reject', { reason: rejectReason });
    } else if (type === 'reschedule') {
      act(id, 'reschedule-reject', { reason: rejectReason });
    }
    setRejectModalOpen(false);
  };

  const cancelRequests = bookings.filter(
    (b) => b.cancelRequested && b.cancelStatus === 'pending'
  );
  const rescheduleRequests = bookings.filter(
    (b) => b.rescheduleRequested && b.rescheduleStatus === 'pending'
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F1EA',
        color: '#333333',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#3A4D39',
              letterSpacing: '0.05em',
              margin: '0 0 8px 0',
            }}
          >
            Pending Requests
          </h1>
          <p style={{ color: '#6E5A48', fontSize: '0.95rem', margin: 0 }}>
            Review and process guest cancellation and rescheduling requests
          </p>
        </div>

        {/* Feedback Alerts */}
        {message && (
          <Alert message={message} type="success" showIcon style={{ marginBottom: 20 }} closable />
        )}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} closable />
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ color: '#6E5A48', marginTop: 12 }}>Retrieving requests...</p>
          </div>
        )}

        {!loading && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Cancellation Requests Section */}
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.5rem',
                  color: '#3A4D39',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ExclamationCircleOutlined /> Cancellation Requests ({cancelRequests.length})
              </h2>

              {cancelRequests.length === 0 ? (
                <div
                  style={{
                    background: 'rgba(250, 250, 248, 0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px dashed #C4BBAF',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6E5A48',
                  }}
                >
                  No pending cancellation requests.
                </div>
              ) : (
                <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                  {cancelRequests.map((b) => (
                    <Card
                      key={b._id}
                      bordered={false}
                      style={{
                        background: 'rgba(250, 250, 248, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        border: '1px solid #E2DCD5',
                        boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                      }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={16}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span
                              style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontWeight: '700',
                                fontSize: '1.15rem',
                                color: '#3A4D39',
                              }}
                            >
                              #{b.bookingRef}
                            </span>
                            <Tag style={{ background: '#33333320', color: '#333333', borderColor: '#333333', fontWeight: 600 }}>
                              CANCELLATION
                            </Tag>
                          </div>

                          <Row gutter={[16, 8]} style={{ fontSize: '0.875rem', color: '#6E5A48' }}>
                            <Col xs={24} sm={12}>
                              <UserOutlined /> Guest: <strong>{b.user?.firstName} {b.user?.lastName}</strong>
                            </Col>
                            <Col xs={24} sm={12}>
                              <HomeOutlined /> Package: <strong>{b.package?.name}</strong>
                            </Col>
                          </Row>

                          <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#333333', background: '#E2DCD540', padding: '8px 12px', borderRadius: '8px' }}>
                            <InfoCircleOutlined style={{ marginRight: '6px', color: '#8A7A68' }} />
                            <strong>Reason:</strong> {b.cancelReason || 'No reason provided'}
                          </div>
                        </Col>

                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                          <Space wrap style={{ justifyContent: 'flex-end' }}>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                              onClick={() => approveCancel(b._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              style={{ background: '#FAFAF8', borderColor: '#333333', color: '#333333' }}
                              onClick={() => openRejectModal(b._id, 'cancel')}
                            >
                              Reject
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </div>

            <Divider style={{ borderColor: '#E2DCD5', margin: '12px 0' }} />

            {/* Reschedule Requests Section */}
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.5rem',
                  color: '#3A4D39',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <SwapOutlined /> Reschedule Requests ({rescheduleRequests.length})
              </h2>

              {rescheduleRequests.length === 0 ? (
                <div
                  style={{
                    background: 'rgba(250, 250, 248, 0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px dashed #C4BBAF',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6E5A48',
                  }}
                >
                  No pending reschedule requests.
                </div>
              ) : (
                <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                  {rescheduleRequests.map((b) => (
                    <Card
                      key={b._id}
                      bordered={false}
                      style={{
                        background: 'rgba(250, 250, 248, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        border: '1px solid #E2DCD5',
                        boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                      }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={16}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span
                              style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontWeight: '700',
                                fontSize: '1.15rem',
                                color: '#3A4D39',
                              }}
                            >
                              #{b.bookingRef}
                            </span>
                            <Tag style={{ background: '#4F6F5220', color: '#4F6F52', borderColor: '#4F6F52', fontWeight: 600 }}>
                              RESCHEDULE
                            </Tag>
                          </div>

                          <div style={{ fontSize: '0.875rem', color: '#6E5A48', marginBottom: '8px' }}>
                            <UserOutlined /> Guest: <strong>{b.user?.firstName} {b.user?.lastName}</strong>
                          </div>

                          <Row gutter={[16, 8]} style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                            <Col xs={24} sm={12}>
                              <div style={{ color: '#8A7A68', fontWeight: 600 }}>Current Schedule:</div>
                              <div style={{ color: '#333333' }}>
                                <CalendarOutlined /> {new Date(b.bookingDate).toDateString()}
                              </div>
                              <div style={{ color: '#6E5A48' }}>{b.startTime} – {b.endTime}</div>
                            </Col>

                            <Col xs={24} sm={12}>
                              <div style={{ color: '#3A4D39', fontWeight: 600 }}>Requested New Schedule:</div>
                              <div style={{ color: '#3A4D39', fontWeight: 600 }}>
                                <CalendarOutlined /> {new Date(b.newDate).toDateString()}
                              </div>
                              <div style={{ color: '#4F6F52' }}>{b.newStartTime} – {b.newEndTime}</div>
                            </Col>
                          </Row>

                          <div style={{ fontSize: '0.875rem', color: '#333333', background: '#E2DCD540', padding: '8px 12px', borderRadius: '8px' }}>
                            <InfoCircleOutlined style={{ marginRight: '6px', color: '#8A7A68' }} />
                            <strong>Reason:</strong> {b.rescheduleReason || 'No reason provided'}
                          </div>
                        </Col>

                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                          <Space wrap style={{ justifyContent: 'flex-end' }}>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              style={{ background: '#4F6F52', borderColor: '#4F6F52' }}
                              onClick={() => approveReschedule(b._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              style={{ background: '#FAFAF8', borderColor: '#333333', color: '#333333' }}
                              onClick={() => openRejectModal(b._id, 'reschedule')}
                            >
                              Reject
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </div>
          </Space>
        )}
      </div>

      {/* Rejection Reason Modal */}
      <Modal
        title={`Reject ${rejectTarget.type === 'cancel' ? 'Cancellation' : 'Reschedule'} Request`}
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalOpen(false)}
        okText="Confirm Rejection"
        okButtonProps={{ style: { background: '#6E5A48', borderColor: '#6E5A48' } }}
      >
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#333333' }}>
            Reason for Rejection:
          </label>
          <Input.TextArea
            rows={3}
            placeholder="Explain why this request cannot be approved..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StaffRequests;