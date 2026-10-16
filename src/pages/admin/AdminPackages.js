import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  InputNumber,
  Select,
  Form,
  Modal,
  Alert,
  Space,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const { TextArea } = Input;

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
  name: '',
  description: '',
  scheduleType: 'Day Tour',
  dayType: 'Any',
  startTime: '9AM',
  endTime: '5PM',
  baseRate: '',
  includedPax: 10,
  maxPax: 20,
  excessPaxRate: 350,
  bedrooms: 1,
  amenities: '',
  inclusions: '',
};

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editPkg, setEditPkg] = useState(null);

  const loadPackages = () => {
    api.get('/packages')
      .then((res) => setPackages(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load packages')
      );
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const prepareBody = (f) => ({
    ...f,
    baseRate: Number(f.baseRate),
    includedPax: Number(f.includedPax),
    maxPax: Number(f.maxPax),
    excessPaxRate: Number(f.excessPaxRate),
    bedrooms: Number(f.bedrooms),
    amenities: f.amenities
      ? f.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    inclusions: f.inclusions
      ? f.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  });

  const handleCreate = async () => {
    setError('');
    setMessage('');
    try {
      await api.post('/packages', prepareBody(form));
      setMessage('Package created.');
      setForm(emptyForm);
      setShowCreate(false);
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create package');
    }
  };

  const handleUpdate = async () => {
    setError('');
    setMessage('');
    try {
      await api.put(`/packages/${editPkg._id}`, prepareBody(editPkg));
      setMessage('Package updated.');
      setEditPkg(null);
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update package');
    }
  };

  const archive = async (id) => {
    if (!window.confirm('Archive this package?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/packages/${id}`);
      setMessage('Package archived.');
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to archive');
    }
  };

  const renderFormFields = (data, setData) => (
    <>
      <Form.Item label="Name" required>
        <Input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="e.g. Day Tour"
        />
      </Form.Item>

      <Form.Item label="Description">
        <TextArea
          rows={2}
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Short description"
        />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label="Schedule Type">
            <Select
              value={data.scheduleType}
              onChange={(val) => setData({ ...data, scheduleType: val })}
              options={[
                { value: 'Day Tour', label: 'Day Tour' },
                { value: 'Night Tour', label: 'Night Tour' },
                { value: '21 Hours', label: '21 Hours' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Day Type">
            <Select
              value={data.dayType}
              onChange={(val) => setData({ ...data, dayType: val })}
              options={[
                { value: 'Any', label: 'Any' },
                { value: 'Weekday', label: 'Weekday' },
                { value: 'Weekend', label: 'Weekend' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label="Start Time">
            <Input
              value={data.startTime}
              onChange={(e) => setData({ ...data, startTime: e.target.value })}
              placeholder="e.g. 9AM"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="End Time">
            <Input
              value={data.endTime}
              onChange={(e) => setData({ ...data, endTime: e.target.value })}
              placeholder="e.g. 5PM"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label="Base Rate (₱)" required>
            <InputNumber
              style={{ width: '100%' }}
              value={data.baseRate}
              onChange={(val) => setData({ ...data, baseRate: val })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bedrooms">
            <InputNumber
              style={{ width: '100%' }}
              value={data.bedrooms}
              onChange={(val) => setData({ ...data, bedrooms: val })}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={8}>
          <Form.Item label="Included Pax">
            <InputNumber
              style={{ width: '100%' }}
              value={data.includedPax}
              onChange={(val) => setData({ ...data, includedPax: val })}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Max Pax" required>
            <InputNumber
              style={{ width: '100%' }}
              value={data.maxPax}
              onChange={(val) => setData({ ...data, maxPax: val })}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Excess Rate (₱)">
            <InputNumber
              style={{ width: '100%' }}
              value={data.excessPaxRate}
              onChange={(val) => setData({ ...data, excessPaxRate: val })}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Amenities (comma-separated)">
        <Input
          value={data.amenities}
          onChange={(e) => setData({ ...data, amenities: e.target.value })}
          placeholder="Pool, Kubo, Grill Station"
        />
      </Form.Item>

      <Form.Item label="Inclusions (comma-separated)">
        <Input
          value={data.inclusions}
          onChange={(e) => setData({ ...data, inclusions: e.target.value })}
          placeholder="Entrance, Use of amenities"
        />
      </Form.Item>
    </>
  );

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
            Manage Packages
          </h1>
          <p style={{ color: C.gray, margin: 0 }}>
            Create, update and archive resort packages.
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
                Package Directory ({packages.length})
              </h2>
              <p style={{ color: C.gray, margin: 0, fontSize: 13 }}>
                Active resort packages
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setForm(emptyForm);
                setShowCreate(true);
              }}
              style={{ background: C.green, borderColor: C.green }}
            >
              Create New Package
            </Button>
          </div>

          {packages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <AppstoreOutlined style={{ fontSize: 38, color: C.medium }} />
              <p style={{ color: C.gray, marginTop: 12 }}>
                No packages available.
              </p>
            </div>
          )}

          {packages.map((p) => (
            <Card
              key={p._id}
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
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      color: C.green,
                      fontSize: 16,
                      margin: '0 0 4px',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      color: C.gray,
                      margin: '0 0 6px',
                      fontSize: 13,
                    }}
                  >
                    {p.description}
                  </p>
                  <Space wrap size={12}>
                    <Tag
                      style={{
                        background: C.cream,
                        color: C.medium,
                        border: 'none',
                      }}
                    >
                      ₱{p.baseRate?.toLocaleString()}
                    </Tag>
                    <span style={{ fontSize: 12, color: C.brown }}>
                      {p.startTime} – {p.endTime}
                    </span>
                    <span style={{ fontSize: 12, color: C.brown }}>
                      Included: {p.includedPax} • Max: {p.maxPax}
                    </span>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() =>
                        setEditPkg({
                          ...p,
                          amenities: (p.amenities || []).join(', '),
                          inclusions: (p.inclusions || []).join(', '),
                        })
                      }
                      style={{ borderColor: C.border }}
                    >
                      Edit
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => archive(p._id)}
                    >
                      Archive
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Card>

        <Modal
          title="Create New Package"
          open={showCreate}
          onOk={handleCreate}
          onCancel={() => setShowCreate(false)}
          okText="Create"
          okButtonProps={{
            style: { background: C.green, borderColor: C.green },
          }}
          width={640}
        >
          <Form layout="vertical">{renderFormFields(form, setForm)}</Form>
        </Modal>

        <Modal
          title="Edit Package"
          open={!!editPkg}
          onOk={handleUpdate}
          onCancel={() => setEditPkg(null)}
          okText="Save"
          okButtonProps={{
            style: { background: C.green, borderColor: C.green },
          }}
          width={640}
        >
          {editPkg && (
            <Form layout="vertical">
              {renderFormFields(editPkg, setEditPkg)}
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminPackages;