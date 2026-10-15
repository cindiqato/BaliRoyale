import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Input, 
  Button, 
  Avatar, 
  Space, 
  Divider, 
  Tag, 
  Alert, 
  Spin, 
  Descriptions 
} from 'antd';
import { 
  UserOutlined, 
  SaveOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  EditOutlined, 
  CloseOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function Profile() {
  const { user, login, token } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.put('/users/me', form);
      // Update auth context with new user info
      login(res.data, token);
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#6E5A48' }}>Loading profile...</p>
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Guest User';

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
      <Title level={2} style={{ color: '#333' }}>My Profile</Title>
      <Paragraph style={{ color: '#6E5A48' }}>Manage your personal account information.</Paragraph>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
      {message && <Alert message={message} type="success" showIcon style={{ marginBottom: '16px' }} />}

      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        {/* Left Column: Profile Summary Card */}
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              textAlign: 'center', 
              borderRadius: '8px', 
              background: '#FAFAF8', 
              border: '1px solid #E2DCD5' 
            }}
          >
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              style={{ 
                marginBottom: '16px', 
                backgroundColor: '#3A4D39', 
                color: '#FAFAF8',
                border: '2px solid #C4BBAF'
              }} 
            />

            <Title level={4} style={{ margin: 0, color: '#333' }}>
              {fullName}
            </Title>
            <Text style={{ color: '#6E5A48', fontSize: '13px' }}>{user?.email}</Text>

            <div style={{ marginTop: '12px' }}>
              <Tag style={{ background: '#4F6F52', color: '#FAFAF8', border: 'none' }}>
                {user?.role?.toUpperCase() || 'GUEST'}
              </Tag>
              <Tag style={{ background: '#8A7A68', color: '#FAFAF8', border: 'none' }}>
                Active Account
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Right Column: Information Display / Edit Form */}
        <Col xs={24} md={16}>
          <Card 
            title={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0, color: '#333' }}>
                  {isEditing ? 'Edit Profile Details' : 'Personal Information'}
                </Title>
                {!isEditing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setIsEditing(true)}
                    style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    icon={<CloseOutlined />} 
                    onClick={() => setIsEditing(false)}
                    style={{ borderColor: '#C4BBAF', color: '#6E5A48' }}
                  >
                    Cancel
                  </Button>
                )}
              </Space>
            }
            style={{ borderRadius: '8px', background: '#FAFAF8', border: '1px solid #E2DCD5' }}
          >
            {!isEditing ? (
              /* VIEW MODE */
              <Descriptions bordered column={1} labelStyle={{ width: '160px', fontWeight: 'bold', color: '#333', background: '#F4F1EA' }}>
                <Descriptions.Item label={<Space><UserOutlined style={{ color: '#4F6F52' }} /> First Name</Space>}>
                  {form.firstName || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><UserOutlined style={{ color: '#4F6F52' }} /> Last Name</Space>}>
                  {form.lastName || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><MailOutlined style={{ color: '#4F6F52' }} /> Email Address</Space>}>
                  {user?.email}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><PhoneOutlined style={{ color: '#4F6F52' }} /> Phone Number</Space>}>
                  {form.phone || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><HomeOutlined style={{ color: '#4F6F52' }} /> Address</Space>}>
                  {form.address || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              /* EDIT MODE FORM */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label><Text strong style={{ color: '#333' }}>First Name</Text></label>
                  <Input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    size="large"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label><Text strong style={{ color: '#333' }}>Last Name</Text></label>
                  <Input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    size="large"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label><Text strong style={{ color: '#333' }}>Phone Number</Text></label>
                  <Input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    size="large"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label><Text strong style={{ color: '#333' }}>Address</Text></label>
                  <Input.TextArea
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <Divider style={{ borderColor: '#E2DCD5' }} />

                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      style={{ borderColor: '#C4BBAF', color: '#6E5A48' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      disabled={saving}
                      loading={saving}
                      icon={<SaveOutlined />}
                      style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Space>
                </div>
              </form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
    </div>
  );
}