import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Spin,
  Alert,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import sampleImage from '../../assets/sample.png';

const { Title, Paragraph, Text } = Typography;

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  gold: '#C5A46D',
  cream: '#F4F1EA',
  white: '#FAFAF8',
  gray: '#6E5A48',
  border: '#E2DCD5',
};

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then((res) => setPkg(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load package'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'guest') {
      alert('Only guests can book packages.');
    } else {
      navigate(`/guest/book?packageId=${pkg._id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: C.gray }}>
          Loading package details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!pkg) return null;

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
        <p>
          <Link to="/packages" style={{ color: C.medium, fontWeight: 500 }}>
            <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Packages
          </Link>
        </p>

        <Row gutter={[32, 32]} style={{ marginTop: '16px' }}>
          {/* Left: image */}
          <Col xs={24} md={14}>
            <img
              src={sampleImage}
              alt={pkg.name}
              style={{
                borderRadius: '12px',
                width: '100%',
                height: 400,
                objectFit: 'cover',
                border: `1px solid ${C.border}`,
              }}
            />
          </Col>

          {/* Right: details */}
          <Col xs={24} md={10}>
            <Title
              level={2}
              style={{
                fontFamily: 'Georgia, serif',
                color: C.green,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {pkg.name}
            </Title>

            {pkg.scheduleType && (
              <Tag
                style={{
                  background: C.green + '20',
                  color: C.green,
                  borderColor: C.green,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {pkg.scheduleType}
              </Tag>
            )}

            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: C.medium,
                margin: '12px 0',
              }}
            >
              ₱{pkg.baseRate?.toLocaleString()}{' '}
              <Text
                type="secondary"
                style={{ fontSize: '14px', fontWeight: 'normal' }}
              >
                / base rate
              </Text>
            </div>

            <Paragraph style={{ color: C.gray }}>{pkg.description}</Paragraph>

            <Divider style={{ borderColor: C.border }} />

            <Title level={5} style={{ color: C.green }}>
              Package Information
            </Title>
            <Space direction="vertical" style={{ marginBottom: '24px', width: '100%' }}>
              <Text>
                <CalendarOutlined style={{ color: C.medium, marginRight: 6 }} />
                <strong>Time:</strong> {pkg.startTime} – {pkg.endTime}
                {pkg.dayType && pkg.dayType !== 'Any' && ` (${pkg.dayType})`}
              </Text>
              <Text>
                <CheckCircleOutlined style={{ color: C.medium, marginRight: 6 }} />
                <strong>Capacity:</strong> {pkg.includedPax} Included Pax (Max:{' '}
                {pkg.maxPax} Pax)
              </Text>
              <Text>
                <CheckCircleOutlined style={{ color: C.medium, marginRight: 6 }} />
                <strong>Excess Rate:</strong> ₱
                {pkg.excessPaxRate?.toLocaleString()} per head
              </Text>
              {pkg.bedrooms && (
                <Text>
                  <HomeOutlined style={{ color: C.medium, marginRight: 6 }} />
                  <strong>Bedrooms:</strong> {pkg.bedrooms}
                </Text>
              )}
            </Space>

            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <>
                <Title level={5} style={{ color: C.green }}>
                  Inclusions
                </Title>
                <Space
                  direction="vertical"
                  style={{ marginBottom: '24px', width: '100%' }}
                >
                  {pkg.inclusions.map((inc, i) => (
                    <Text key={i}>
                      <CheckCircleOutlined
                        style={{ color: C.medium, marginRight: 6 }}
                      />
                      {inc}
                    </Text>
                  ))}
                </Space>
              </>
            )}

            {pkg.amenities && pkg.amenities.length > 0 && (
              <>
                <Title level={5} style={{ color: C.green }}>
                  Amenities
                </Title>
                <Space
                  direction="vertical"
                  style={{ marginBottom: '24px', width: '100%' }}
                >
                  {pkg.amenities.map((amenity, i) => (
                    <Text key={i}>
                      <CheckCircleOutlined
                        style={{ color: C.medium, marginRight: 6 }}
                      />
                      {amenity}
                    </Text>
                  ))}
                </Space>
              </>
            )}

            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              block
              onClick={handleBookNow}
              style={{
                background: C.green,
                borderColor: C.green,
                borderRadius: 6,
                height: 46,
                fontWeight: 600,
                marginTop: 12,
              }}
            >
              Book Now
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}