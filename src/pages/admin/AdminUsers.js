import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Alert,
  Select,
  Space,
  Modal,
  Form,
  Tag,
  Spin,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
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

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'guest',
};

const roleOptions = [
  { value: 'guest', label: 'Guest' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = () => {
    api.get('/getUsers')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    setError('');
    setMessage('');
    try {
      await api.post('/createUser', createForm);
      setMessage('User created.');
      setCreateForm(emptyForm);
      setShowCreate(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    setError('');
    setMessage('');
    try {
      await api.put(`/updateUser/${editUser._id}`, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        phone: editUser.phone,
        address: editUser.address,
        role: editUser.role,
        status: editUser.status,
      });
      setMessage('User updated.');
      setEditUser(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/deleteUser/${id}`);
      setMessage('User deactivated.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate');
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
            Manage Users
          </h1>
          <p style={{ color: C.gray, margin: 0 }}>
            View, create and manage system users.
          </p>
        </div>

        {message && (
          <Alert message={message} type="success" showIcon closable style={{ marginBottom: 16 }} />
        )}
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
                User Directory ({users.length})
              </h2>
              <p style={{ color: C.gray, margin: 0, fontSize: 13 }}>
                Manage registered accounts
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreate(true)}
              style={{ background: C.green, borderColor: C.green }}
            >
              Create New User
            </Button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          )}

          {!loading &&
            users.map((u) => (
              <Card
                key={u._id}
                bordered={false}
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
                bodyStyle={{ padding: 20 }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="60px">
                    <Avatar
                      size={46}
                      style={{
                        background: C.pink,
                        color: C.green,
                        fontWeight: 700,
                      }}
                    >
                      {u.firstName?.charAt(0)}
                      {u.lastName?.charAt(0)}
                    </Avatar>
                  </Col>

                  <Col flex="auto" style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        color: C.green,
                        fontSize: 16,
                        margin: '0 0 4px',
                      }}
                    >
                      {u.firstName} {u.lastName}
                    </h3>
                    <p
                      style={{
                        color: C.brown,
                        margin: 0,
                        fontSize: 13,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {u.email}
                    </p>
                  </Col>

                  <Col>
                    <Space wrap>
                      <Tag
                        style={{
                          background: C.cream,
                          color: C.medium,
                          border: 'none',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {u.role}
                      </Tag>
                      <Tag
                        style={{
                          background: u.status === 'active' ? '#E8EFE5' : C.pink,
                          color: u.status === 'active' ? C.green : '#A13E3E',
                          border: 'none',
                          textTransform: 'capitalize',
                        }}
                      >
                        {u.status}
                      </Tag>
                      {u.isArchived && (
                        <Tag color="default">Archived</Tag>
                      )}
                    </Space>
                  </Col>

                  <Col>
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setEditUser(u)}
                        style={{ borderColor: C.border }}
                      >
                        Edit
                      </Button>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => deactivate(u._id)}
                      >
                        Deactivate
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
        </Card>

        {/* Create Modal */}
        <Modal
          title="Create New User"
          open={showCreate}
          onOk={handleCreate}
          onCancel={() => setShowCreate(false)}
          okText="Create"
          okButtonProps={{ style: { background: C.green, borderColor: C.green } }}
        >
          <Form layout="vertical">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="First Name" required>
                  <Input
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, firstName: e.target.value })
                    }
                    prefix={<UserOutlined style={{ color: C.brown }} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Last Name" required>
                  <Input
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastName: e.target.value })
                    }
                    prefix={<UserOutlined style={{ color: C.brown }} />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Email" required>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
            </Form.Item>

            <Form.Item label="Password" required>
              <Input.Password
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Phone (optional)">
                  <Input
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Role">
                  <Select
                    value={createForm.role}
                    onChange={(val) =>
                      setCreateForm({ ...createForm, role: val })
                    }
                    options={roleOptions}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Address (optional)">
              <Input
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm({ ...createForm, address: e.target.value })
                }
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Edit User"
          open={!!editUser}
          onOk={handleUpdate}
          onCancel={() => setEditUser(null)}
          okText="Save"
          okButtonProps={{ style: { background: C.green, borderColor: C.green } }}
        >
          {editUser && (
            <Form layout="vertical">
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="First Name">
                    <Input
                      value={editUser.firstName}
                      onChange={(e) =>
                        setEditUser({ ...editUser, firstName: e.target.value })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Last Name">
                    <Input
                      value={editUser.lastName}
                      onChange={(e) =>
                        setEditUser({ ...editUser, lastName: e.target.value })
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Phone">
                    <Input
                      value={editUser.phone || ''}
                      onChange={(e) =>
                        setEditUser({ ...editUser, phone: e.target.value })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Role">
                    <Select
                      value={editUser.role}
                      onChange={(val) =>
                        setEditUser({ ...editUser, role: val })
                      }
                      options={roleOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Address">
                <Input
                  value={editUser.address || ''}
                  onChange={(e) =>
                    setEditUser({ ...editUser, address: e.target.value })
                  }
                />
              </Form.Item>

              <Form.Item label="Status">
                <Select
                  value={editUser.status}
                  onChange={(val) =>
                    setEditUser({ ...editUser, status: val })
                  }
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;