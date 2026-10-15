import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button, Typography, Row, Col, Divider, Image, Space, Rate, Spin } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

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
        <p style={{ marginTop: '16px' }}>Loading package details...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ textAlign: 'center', padding: '40px', color: '#ff4d4f' }}>{error}</p>;
  }

  if (!pkg) return null;

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
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <p>
        <Link to="/packages">
          <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Packages
        </Link>
      </p>

      <Row gutter={[32, 32]} style={{ marginTop: '16px' }}>
        {/* Left Column: Image Gallery Placeholder */}
        <Col xs={24} md={14}>
          <Image 
            src={pkg.image || "https://via.placeholder.com/600x350"} 
            alt={pkg.name} 
            style={{ borderRadius: '8px', marginBottom: '12px', width: '100%', objectFit: 'cover' }} 
          />
          <Space>
            <Image width={100} src="https://via.placeholder.com/100x70" />
            <Image width={100} src="https://via.placeholder.com/100x70" />
            <Image width={100} src="https://via.placeholder.com/100x70" />
          </Space>
        </Col>

        {/* Right Column: Details & Book Action */}
        <Col xs={24} md={10}>
          <Title level={2}>{pkg.name}</Title>
          <Rate disabled defaultValue={4.8} style={{ marginBottom: '12px' }} /> <Text type="secondary">(4.8 / 5)</Text>
          
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16', margin: '12px 0' }}>
            ₱{pkg.baseRate?.toLocaleString()} <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>/ base rate</Text>
          </div>

          <Paragraph type="secondary">
            {pkg.description}
          </Paragraph>

          <Divider />

          {/* Schedule & Capacity Specs */}
          <Title level={5}>Package Information:</Title>
          <Space direction="vertical" style={{ marginBottom: '24px', width: '100%' }}>
            <Text><CalendarOutlined style={{ color: '#1890ff', marginRight: '6px' }} /> <strong>Time:</strong> {pkg.startTime} – {pkg.endTime} {pkg.dayType && pkg.dayType !== 'Any' && ` (${pkg.dayType})`}</Text>
            <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>Schedule Type:</strong> {pkg.scheduleType || 'Any'}</Text>
            <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>Capacity:</strong> {pkg.includedPax} Included Pax (Max: {pkg.maxPax} Pax)</Text>
            <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>Excess Rate:</strong> ₱{pkg.excessPaxRate?.toLocaleString()} per head</Text>
            {pkg.bedrooms && <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>Bedrooms:</strong> {pkg.bedrooms}</Text>}
          </Space>

          {/* Inclusions List */}
          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <>
              <Title level={5}>Inclusions:</Title>
              <Space direction="vertical" style={{ marginBottom: '24px' }}>
                {pkg.inclusions.map((inc, i) => (
                  <Text key={i}><CheckCircleOutlined style={{ color: '#52c41a' }} /> {inc}</Text>
                ))}
              </Space>
            </>
          )}

          {/* Amenities List */}
          {pkg.amenities && pkg.amenities.length > 0 && (
            <>
              <Title level={5}>Amenities:</Title>
              <Space direction="vertical" style={{ marginBottom: '24px' }}>
                {pkg.amenities.map((amenity, i) => (
                  <Text key={i}><CheckCircleOutlined style={{ color: '#1890ff' }} /> {amenity}</Text>
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
            style={{ marginTop: '12px' }}
          >
            Book Now
          </Button>
        </Col>
      </Row>
    </div>
    </div>
  );
}