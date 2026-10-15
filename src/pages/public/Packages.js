import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Card, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space, 
  Spin, 
  Empty, 
  Tag, 
  Alert 
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    api.get('/packages')
      .then((res) => setPackages(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load packages'))
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort Logic
  const filteredPackages = packages
    .filter((pkg) => pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.baseRate - b.baseRate;
      return b.baseRate - a.baseRate;
    });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#6E5A48' }}>Loading packages...</p>
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#333', marginBottom: '8px' }}>Our Packages</Title>
        <Paragraph style={{ color: '#6E5A48', fontSize: '16px' }}>
          Choose from our exclusive resort packages
        </Paragraph>
      </div>

      {/* Search and Filters Bar */}
      <Space style={{ marginBottom: '24px', width: '100%', justifyContent: 'space-between' }} wrap>
        <Input 
          placeholder="Search packages..." 
          prefix={<SearchOutlined style={{ color: '#8A7A68' }} />} 
          style={{ width: 280, borderRadius: '6px' }} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Space wrap>
          <Select 
            defaultValue="asc" 
            style={{ width: 180 }} 
            onChange={(val) => setSortOrder(val)}
          >
            <Option value="asc">Price: Low to High</Option>
            <Option value="desc">Price: High to Low</Option>
          </Select>
        </Space>
      </Space>

      {/* Packages Grid or Empty State */}
      {filteredPackages.length === 0 ? (
        <Card style={{ textAlign: 'center', background: '#FAFAF8', border: '1px solid #E2DCD5', borderRadius: '8px', padding: '40px 0' }}>
          <Empty 
            description={<span style={{ color: '#8A7A68', fontSize: '15px' }}>No packages available yet.</span>} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredPackages.map((pkg) => (
            <Col xs={24} sm={12} lg={8} key={pkg._id}>
              <Card
                hoverable
                style={{ 
                  borderRadius: '8px', 
                  background: '#FAFAF8', 
                  border: '1px solid #E2DCD5',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
                cover={
                  <img 
                    alt={pkg.name} 
                    src={pkg.image || "https://via.placeholder.com/350x200?text=Resort+Package"} 
                    style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', height: '180px', objectFit: 'cover' }}
                  />
                }
              >
                <div>
                  <Title level={4} style={{ margin: '0 0 8px 0', color: '#333' }}>
                    {pkg.name}
                  </Title>

                  <Paragraph 
                    ellipsis={{ rows: 2 }} 
                    style={{ color: '#6E5A48', marginBottom: '16px', minHeight: '40px' }}
                  >
                    {pkg.description}
                  </Paragraph>

                  {/* Schedule Details */}
                  <div style={{ marginBottom: '8px', fontSize: '13px', color: '#333' }}>
                    <CalendarOutlined style={{ color: '#4F6F52', marginRight: '6px' }} />
                    <strong>Schedule:</strong> {pkg.startTime} – {pkg.endTime}
                    {pkg.dayType && pkg.dayType !== 'Any' && ` (${pkg.dayType})`}
                  </div>

                  {/* Capacity Details */}
                  <div style={{ marginBottom: '16px', fontSize: '13px', color: '#333' }}>
                    <UserOutlined style={{ color: '#4F6F52', marginRight: '6px' }} />
                    <strong>Included Pax:</strong> {pkg.includedPax} • <strong>Max Pax:</strong> {pkg.maxPax}
                  </div>
                </div>

                {/* Price & Action */}
                <div style={{ borderTop: '1px solid #E2DCD5', paddingTop: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Text style={{ color: '#6E5A48', fontSize: '12px' }}>Base Rate</Text>
                    <Text style={{ color: '#3A4D39', fontWeight: 'bold', fontSize: '18px' }}>
                      ₱{pkg.baseRate?.toLocaleString()}
                    </Text>
                  </div>

                  <Link to={`/packages/${pkg._id}`}>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />} 
                      block 
                      style={{ background: '#3A4D39', borderColor: '#3A4D39', color: '#FAFAF8', borderRadius: '6px' }}
                    >
                      View Details →
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
    </div>
  );
}