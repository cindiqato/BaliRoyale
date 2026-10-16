import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Typography, Empty, Alert } from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
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

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/packages')
      .then((res) => setPackages(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load packages')
      );
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: C.cream,
          padding: '40px 20px',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      </div>
    );
  }

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
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            Bali Royale
          </p>
          <Title
            level={1}
            style={{
              fontFamily: 'Georgia, serif',
              color: C.green,
              margin: '12px 0 8px',
              fontWeight: 400,
            }}
          >
            Our Packages
          </Title>
          <Paragraph style={{ color: C.gray, fontSize: '16px' }}>
            Choose from our exclusive resort packages
          </Paragraph>
        </div>

        {packages.length === 0 ? (
          <Card
            style={{
              textAlign: 'center',
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              padding: '40px 0',
            }}
          >
            <Empty
              description={
                <span style={{ color: C.gray, fontSize: '15px' }}>
                  No packages available yet.
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {packages.map((pkg) => (
              <Col xs={24} sm={12} lg={8} key={pkg._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                  bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    padding: '20px',
                  }}
                  cover={
                    <img
                      alt={pkg.name}
                      src={sampleImage}
                      style={{
                        height: '180px',
                        objectFit: 'cover',
                        width: '100%',
                      }}
                    />
                  }
                >
                  <div style={{ flex: 1 }}>
                    <Title
                      level={4}
                      style={{
                        margin: '0 0 8px 0',
                        color: C.green,
                        fontFamily: 'Georgia, serif',
                        fontWeight: 600,
                      }}
                    >
                      {pkg.name}
                    </Title>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        color: C.gray,
                        marginBottom: '16px',
                        minHeight: '40px',
                      }}
                    >
                      {pkg.description}
                    </Paragraph>

                    <div
                      style={{
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CalendarOutlined style={{ color: C.medium }} />
                      <strong>Schedule:</strong> {pkg.startTime} – {pkg.endTime}
                      {pkg.dayType &&
                        pkg.dayType !== 'Any' &&
                        ` (${pkg.dayType})`}
                    </div>

                    <div
                      style={{
                        marginBottom: '16px',
                        fontSize: '13px',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <UserOutlined style={{ color: C.medium }} />
                      <strong>Included Pax:</strong> {pkg.includedPax} •{' '}
                      <strong>Max Pax:</strong> {pkg.maxPax}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: '16px',
                      marginTop: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Text style={{ color: C.gray, fontSize: '12px' }}>
                        Base Rate
                      </Text>
                      <Text
                        style={{
                          color: C.green,
                          fontWeight: 'bold',
                          fontSize: '18px',
                        }}
                      >
                        ₱{pkg.baseRate?.toLocaleString()}
                      </Text>
                    </div>

                    <Link to={`/packages/${pkg._id}`}>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        block
                        style={{
                          background: C.green,
                          borderColor: C.green,
                          color: '#FAFAF8',
                          borderRadius: '6px',
                          height: 40,
                        }}
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