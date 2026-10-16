import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import homeImage from '../../assets/home.png';

const C = {
  green: '#3A4D39',
  medium: '#4F6F52',
  gold: '#C5A46D',
  cream: '#F4F1EA',
  white: '#FFFFFF',
  gray: '#6E5A48',
  border: '#E2DCD5',
};

const Home = () => {
  const { user } = useAuth();

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'staff'
      ? '/staff'
      : '/guest';

  const features = [
    {
      icon: <HomeOutlined style={{ fontSize: 32, color: C.gold }} />,
      title: 'Exclusive Private Resort',
      description:
        'Enjoy a peaceful and private getaway with your family and friends.',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: C.gold }} />,
      title: 'Complete Amenities',
      description:
        'Experience comfort and convenience throughout your stay.',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: C.gold }} />,
      title: 'Flexible Schedules',
      description: 'Choose from Day Tour, Night Tour, and 21-Hour stays.',
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 32, color: C.gold }} />,
      title: 'Easy Online Booking',
      description:
        'Browse packages, check availability, and reserve online.',
    },
  ];

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      {/* HERO */}
      <section
        style={{
          minHeight: 600,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.55)), url(${homeImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            Welcome to Bali Royale Private Resort
          </p>

          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(38px, 6vw, 68px)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: C.white,
              margin: '28px 0',
            }}
          >
            Escape the Ordinary.
            <br />
            Experience Luxury.
          </h1>

          <p
            style={{
              color: '#F2F2F2',
              fontSize: 16,
              lineHeight: 1.9,
              maxWidth: 620,
              margin: '0 auto 30px',
            }}
          >
            Plan your perfect escape where comfort, relaxation, and
            unforgettable moments come together.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Link to="/packages">
              <Button
                size="large"
                style={{
                  background: C.gold,
                  borderColor: C.gold,
                  color: C.green,
                  fontWeight: 'bold',
                  borderRadius: 4,
                  height: 48,
                  padding: '0 32px',
                }}
              >
                Explore Your Stay →
              </Button>
            </Link>

            {user ? (
              <Link to={dashboardLink}>
                <Button
                  size="large"
                  style={{
                    background: 'transparent',
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: C.white,
                    fontWeight: 'bold',
                    borderRadius: 4,
                    height: 48,
                    padding: '0 32px',
                  }}
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button
                  size="large"
                  style={{
                    background: 'transparent',
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: C.white,
                    fontWeight: 'bold',
                    borderRadius: 4,
                    height: 48,
                    padding: '0 32px',
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        style={{
          padding: '70px 20px',
          textAlign: 'center',
          background: C.cream,
        }}
      >
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
          Your Getaway Starts Here
        </p>

        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            color: C.green,
            margin: '15px 0 20px',
          }}
        >
          Welcome to Bali Royale
        </h2>

        <p
          style={{
            maxWidth: 700,
            margin: '0 auto',
            color: C.gray,
            fontSize: 15,
            lineHeight: 1.9,
          }}
        >
          Welcome{user ? `, ${user.firstName}` : ''}! Bali Royale Private
          Resort is an exclusive private resort located in Rodriguez, Rizal.
          Enjoy quality time with your loved ones, explore our available
          packages, and experience a relaxing getaway.
        </p>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: '70px 20px 90px',
          background: '#EEEAE3',
          textAlign: 'center',
        }}
      >
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
          The Bali Royale Experience
        </p>

        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            color: C.green,
            margin: '15px 0 20px',
          }}
        >
          Why Choose Bali Royale?
        </h2>

        <Row
          gutter={[22, 22]}
          align="stretch"
          style={{ maxWidth: 1100, margin: '45px auto 0' }}
        >
          {features.map((feature) => (
            <Col xs={24} sm={12} lg={6} key={feature.title}>
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '35px 25px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  minHeight: 260,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ marginBottom: 20 }}>{feature.icon}</div>

                <h3
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: C.green,
                    fontSize: 19,
                    marginBottom: 15,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: C.gray,
                    fontSize: 14,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default Home;