import { useEffect, useState } from 'react';
import {
  Tag,
  Button,
  Card,
  Alert,
  Row,
  Col,
  Space,
  Modal,
  Input,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
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

const StaffRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState({ id: null, type: null });
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load bookings')
      );
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
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
        backgroundColor: C.cream,
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2.5rem',
              fontWeight: '600',
              color: C.green,
              letterSpacing: '0.05em',
              margin: '0 0 8px 0',
            }}
          >
            Pending Requests
          </h1>
          <p style={{ color: C.gray, fontSize: '0.95rem', margin: 0 }}>
            Review and process guest cancellation and rescheduling requests
          </p>
        </div>

        {message && (
          <Alert
            message={message}
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
            closable
          />
        )}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            closable
          />
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.5rem',
                color: C.green,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ExclamationCircleOutlined /> Cancellation Requests (
              {cancelRequests.length})
            </h2>

            {cancelRequests.length === 0 ? (
              <div
                style={{
                  background: 'rgba(250, 250, 248, 0.5)',
                  backdropFilter: 'blur(8px)',
                  border: `1px dashed ${C.border}`,
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: C.gray,
                }}
              >
                No pending cancellation requests.
              </div>
            ) : (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                {cancelRequests.map((b) => (
                  <Card
                    key={b._id}
                    bordered={false}
                    style={{
                      background: 'rgba(250, 250, 248, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderRadius: '16px',
                      border: `1px solid ${C.border}`,
                      boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={16}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Georgia, serif',
                              fontWeight: '700',
                              fontSize: '1.15rem',
                              color: C.green,
                            }}
                          >
                            #{b.bookingRef}
                          </span>
                          <Tag
                            style={{
                              background: '#33333320',
                              color: '#333333',
                              borderColor: '#333333',
                              fontWeight: 600,
                            }}
                          >
                            CANCELLATION
                          </Tag>
                        </div>

                        <Row
                          gutter={[16, 8]}
                          style={{ fontSize: '0.875rem', color: C.gray }}
                        >
                          <Col xs={24} sm={12}>
                            <UserOutlined /> Guest:{' '}
                            <strong>
                              {b.user?.firstName} {b.user?.lastName}
                            </strong>
                          </Col>
                          <Col xs={24} sm={12}>
                            <HomeOutlined /> Package:{' '}
                            <strong>{b.package?.name}</strong>
                          </Col>
                        </Row>

                        <div
                          style={{
                            marginTop: '10px',
                            fontSize: '0.875rem',
                            color: '#333333',
                            background: '#E2DCD540',
                            padding: '8px 12px',
                            borderRadius: '8px',
                          }}
                        >
                          <InfoCircleOutlined
                            style={{ marginRight: '6px', color: C.brown }}
                          />
                          <strong>Reason:</strong>{' '}
                          {b.cancelReason || 'No reason provided'}
                        </div>
                      </Col>

                      <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Space wrap style={{ justifyContent: 'flex-end' }}>
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{
                              background: C.medium,
                              borderColor: C.medium,
                            }}
                            onClick={() => approveCancel(b._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            style={{
                              background: C.white,
                              borderColor: '#333333',
                              color: '#333333',
                            }}
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

          <Divider style={{ borderColor: C.border, margin: '12px 0' }} />

          <div>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.5rem',
                color: C.green,
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
                  border: `1px dashed ${C.border}`,
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: C.gray,
                }}
              >
                No pending reschedule requests.
              </div>
            ) : (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                {rescheduleRequests.map((b) => (
                  <Card
                    key={b._id}
                    bordered={false}
                    style={{
                      background: 'rgba(250, 250, 248, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderRadius: '16px',
                      border: `1px solid ${C.border}`,
                      boxShadow: '0 8px 24px 0 rgba(58, 77, 57, 0.08)',
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={16}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Georgia, serif',
                              fontWeight: '700',
                              fontSize: '1.15rem',
                              color: C.green,
                            }}
                          >
                            #{b.bookingRef}
                          </span>
                          <Tag
                            style={{
                              background: '#4F6F5220',
                              color: C.medium,
                              borderColor: C.medium,
                              fontWeight: 600,
                            }}
                          >
                            RESCHEDULE
                          </Tag>
                        </div>

                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: C.gray,
                            marginBottom: '8px',
                          }}
                        >
                          <UserOutlined /> Guest:{' '}
                          <strong>
                            {b.user?.firstName} {b.user?.lastName}
                          </strong>
                        </div>

                        <Row
                          gutter={[16, 8]}
                          style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                        >
                          <Col xs={24} sm={12}>
                            <div style={{ color: C.brown, fontWeight: 600 }}>
                              Current Schedule:
                            </div>
                            <div style={{ color: '#333333' }}>
                              <CalendarOutlined />{' '}
                              {new Date(b.bookingDate).toDateString()}
                            </div>
                            <div style={{ color: C.gray }}>
                              {b.startTime} – {b.endTime}
                            </div>
                          </Col>

                          <Col xs={24} sm={12}>
                            <div style={{ color: C.green, fontWeight: 600 }}>
                              Requested New Schedule:
                            </div>
                            <div style={{ color: C.green, fontWeight: 600 }}>
                              <CalendarOutlined />{' '}
                              {new Date(b.newDate).toDateString()}
                            </div>
                            <div style={{ color: C.medium }}>
                              {b.newStartTime} – {b.newEndTime}
                            </div>
                          </Col>
                        </Row>

                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#333333',
                            background: '#E2DCD540',
                            padding: '8px 12px',
                            borderRadius: '8px',
                          }}
                        >
                          <InfoCircleOutlined
                            style={{ marginRight: '6px', color: C.brown }}
                          />
                          <strong>Reason:</strong>{' '}
                          {b.rescheduleReason || 'No reason provided'}
                        </div>
                      </Col>

                      <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Space wrap style={{ justifyContent: 'flex-end' }}>
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{
                              background: C.medium,
                              borderColor: C.medium,
                            }}
                            onClick={() => approveReschedule(b._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            style={{
                              background: C.white,
                              borderColor: '#333333',
                              color: '#333333',
                            }}
                            onClick={() =>
                              openRejectModal(b._id, 'reschedule')
                            }
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
      </div>

      <Modal
        title={`Reject ${
          rejectTarget.type === 'cancel' ? 'Cancellation' : 'Reschedule'
        } Request`}
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalOpen(false)}
        okText="Confirm Rejection"
        okButtonProps={{ style: { background: C.brown, borderColor: C.brown } }}
      >
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display: 'block',
              marginBottom: 6,
              fontWeight: 500,
              color: '#333333',
            }}
          >
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