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
  Descriptions,
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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

export default function Profile() {
  const { user, login, token } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
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
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load profile')
      );
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
      login(res.data, token);
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Guest User';

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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
        <Title level={2} style={{ color: C.green }}>
          My Profile
        </Title>
        <Paragraph style={{ color: C.gray }}>
          Manage your personal account information.
        </Paragraph>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        {message && (
          <Alert
            message={message}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                background: C.white,
                border: `1px solid ${C.border}`,
              }}
            >
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{
                  marginBottom: '16px',
                  backgroundColor: C.green,
                  color: C.white,
                  border: `2px solid ${C.border}`,
                }}
              />

              <Title level={4} style={{ margin: 0, color: '#333' }}>
                {fullName}
              </Title>
              <Text style={{ color: C.gray, fontSize: '13px' }}>
                {user?.email}
              </Text>

              <div style={{ marginTop: '12px' }}>
                <Space size={8} wrap style={{ justifyContent: 'center' }}>
                  <Tag
                    style={{
                      background: C.medium,
                      color: C.white,
                      border: 'none',
                      margin: 0,
                    }}
                  >
                    {user?.role?.toUpperCase() || 'GUEST'}
                  </Tag>
                  <Tag
                    style={{
                      background: C.brown,
                      color: C.white,
                      border: 'none',
                      margin: 0,
                    }}
                  >
                    Active Account
                  </Tag>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card
              title={
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Title level={4} style={{ margin: 0, color: '#333' }}>
                    {isEditing ? 'Edit Profile Details' : 'Personal Information'}
                  </Title>
                  {!isEditing ? (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: C.green,
                        borderColor: C.green,
                        color: C.white,
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => setIsEditing(false)}
                      style={{ borderColor: C.border, color: C.gray }}
                    >
                      Cancel
                    </Button>
                  )}
                </Space>
              }
              style={{
                borderRadius: '8px',
                background: C.white,
                border: `1px solid ${C.border}`,
              }}
            >
              {!isEditing ? (
                <Descriptions
                  bordered
                  column={1}
                  labelStyle={{
                    width: '160px',
                    fontWeight: 'bold',
                    color: '#333',
                    background: C.cream,
                  }}
                >
                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined style={{ color: C.medium }} /> First Name
                      </Space>
                    }
                  >
                    {form.firstName || <Text type="secondary">Not set</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined style={{ color: C.medium }} /> Last Name
                      </Space>
                    }
                  >
                    {form.lastName || <Text type="secondary">Not set</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <MailOutlined style={{ color: C.medium }} /> Email
                        Address
                      </Space>
                    }
                  >
                    {user?.email}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <PhoneOutlined style={{ color: C.medium }} /> Phone
                        Number
                      </Space>
                    }
                  >
                    {form.phone || <Text type="secondary">Not set</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <HomeOutlined style={{ color: C.medium }} /> Address
                      </Space>
                    }
                  >
                    {form.address || <Text type="secondary">Not set</Text>}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label>
                      <Text strong style={{ color: '#333' }}>
                        First Name
                      </Text>
                    </label>
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
                    <label>
                      <Text strong style={{ color: '#333' }}>
                        Last Name
                      </Text>
                    </label>
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
                    <label>
                      <Text strong style={{ color: '#333' }}>
                        Phone Number
                      </Text>
                    </label>
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
                    <label>
                      <Text strong style={{ color: '#333' }}>
                        Address
                      </Text>
                    </label>
                    <Input.TextArea
                      rows={3}
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      style={{ marginTop: '6px' }}
                    />
                  </div>

                  <Divider style={{ borderColor: C.border }} />

                  <div style={{ textAlign: 'right' }}>
                    <Space>
                      <Button
                        onClick={() => setIsEditing(false)}
                        style={{ borderColor: C.border, color: C.gray }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={saving}
                        loading={saving}
                        icon={<SaveOutlined />}
                        style={{
                          background: C.green,
                          borderColor: C.green,
                          color: C.white,
                        }}
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