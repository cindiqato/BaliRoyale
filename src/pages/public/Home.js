
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'staff'
      ? '/staff'
      : '/guest';

  // Replace with your own resort photo
  const resortImage =
    'https://scontent.fmnl8-8.fna.fbcdn.net/v/t39.30808-6/597701371_122111557509070228_5005038334623627047_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHRCGAl4oo6dDLzg59JlTRUKIJtHM6_7Y8ogm0czr_tj_Io5WtrviUk68JyjgowFAraFOmLTl2RkLmCnThZREev&_nc_ohc=27YOA0vA-20Q7kNvwGtgIW6&_nc_oc=AdpPUTGixsBtJh07Nw51C9aGK8I6Nc6hdsnvjWWd_OapJ0HrAq7PEGCzR3NlpWgnXgI&_nc_zt=23&_nc_ht=scontent.fmnl8-8.fna&_nc_gid=GJExG_-qhSs4iBcNbYxSIQ&_nc_ss=7b2a8&oh=00_AQNYA3tHwpJsFug3aZNRZacRqJritDvZ75Aw2REZpwDy4Q&oe=6AD68404'
  const C = {
    green: '#193F32',
    gold: '#C5A46D',
    cream: '#F7F5F1',
    white: '#FFFFFF',
    gray: '#666666',
  };

  const s = {
    page: {
      fontFamily: 'Arial, sans-serif',
      background: C.cream,
      minHeight: '100vh',
      color: C.green,
    },
    navbar: {
      background: C.white,
      padding: '22px 7%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 25,
      flexWrap: 'wrap',
    },
    logo: {
      fontFamily: 'Georgia, serif',
      fontSize: 29,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: C.green,
      textDecoration: 'none',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 30,
    },
    navLink: {
      color: C.green,
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 500,
    },
    bookButton: {
      display: 'inline-block',
      background: C.green,
      color: C.white,
      padding: '14px 27px',
      borderRadius: 4,
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 'bold',
    },
    hero: {
      minHeight: '650px',
      backgroundImage: `linear-gradient(
        rgba(0, 0, 0, 0.46),
        rgba(0, 0, 0, 0.56)
      ), url("${resortImage}")`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      boxSizing: 'border-box',
    },
    heroContent: {
      maxWidth: 900,
      margin: '0 auto',
    },
    eyebrow: {
      color: C.gold,
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 4,
      textTransform: 'uppercase',
    },
    heroTitle: {
      fontFamily: 'Georgia, serif',
      fontSize: 'clamp(42px, 6vw, 76px)',
      fontWeight: 400,
      lineHeight: 1.12,
      color: C.white,
      margin: '28px 0',
    },
    heroDescription: {
      color: '#F2F2F2',
      fontSize: 16,
      lineHeight: 1.9,
      maxWidth: 620,
      margin: '0 auto 30px',
    },
    goldButton: {
      display: 'inline-block',
      background: C.gold,
      color: C.green,
      padding: '17px 30px',
      borderRadius: 4,
      fontSize: 13,
      fontWeight: 'bold',
      textDecoration: 'none',
      margin: 6,
    },
    outlineButton: {
      display: 'inline-block',
      background: 'transparent',
      color: C.white,
      border: '1px solid rgba(255,255,255,0.8)',
      padding: '16px 29px',
      borderRadius: 4,
      fontSize: 13,
      fontWeight: 'bold',
      textDecoration: 'none',
      margin: 6,
    },
    section: {
      padding: '80px 7%',
      textAlign: 'center',
    },
    sectionTitle: {
      fontFamily: 'Georgia, serif',
      fontSize: 'clamp(30px, 4vw, 46px)',
      fontWeight: 400,
      color: C.green,
      margin: '15px 0 20px',
    },
    features: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 22,
      maxWidth: 1100,
      margin: '45px auto 0',
    },
    featureCard: {
      background: C.white,
      border: '1px solid #E8E3DB',
      borderRadius: 8,
      padding: '35px 25px',
      textAlign: 'center',
    },
    footer: {
      background: C.green,
      color: C.white,
      textAlign: 'center',
      padding: '35px 20px',
      fontSize: 13,
      lineHeight: 1.8,
    },
  };

  const features = [
    {
      icon: '✦',
      title: 'Exclusive Private Resort',
      description:
        'Enjoy a peaceful and private getaway with your family and friends.',
    },
    {
      icon: '⌂',
      title: 'Complete Amenities',
      description:
        'Experience comfort and convenience throughout your stay.',
    },
    {
      icon: '◷',
      title: 'Flexible Schedules',
      description:
        'Choose from Day Tour, Night Tour, and 21-Hour stays.',
    },
    {
      icon: '✓',
      title: 'Easy Online Booking',
      description:
        'Browse packages, check availability, and reserve online.',
    },
  ];

  return (
    <div style={s.page}>

      {/* NAVIGATION BAR */}
      <nav style={s.navbar}>
        <Link to="/" style={s.logo}>
          BALI ROYALE
          <span style={{ color: C.gold }}>.</span>
        </Link>

        <div style={s.navLinks}>
          <Link to="/" style={s.navLink}>Home</Link>
          <a href="#about" style={s.navLink}>About</a>
          <Link to="/packages" style={s.navLink}>
            Accommodations
          </Link>
          <a href="#contact" style={s.navLink}>Contact</a>
        </div>

        <Link
          to={user ? dashboardLink : '/register'}
          style={s.bookButton}
        >
          {user ? 'My Dashboard' : 'Book Now'}
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section style={s.hero}>
        <div style={s.heroContent}>

          <p style={s.eyebrow}>
            WELCOME TO BALI ROYALE PRIVATE RESORT
          </p>

          <h1 style={s.heroTitle}>
            Escape the Ordinary.
            <br />
            Experience Luxury.
          </h1>

          <p style={s.heroDescription}>
            Discover your perfect getaway in Rodriguez, Rizal,
            where comfort, relaxation, and unforgettable
            moments come together.
          </p>

          <Link to="/packages" style={s.goldButton}>
            Explore Your Stay →
          </Link>

          {user ? (
            <Link to={dashboardLink} style={s.outlineButton}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" style={s.outlineButton}>
              Sign Up
            </Link>
          )}

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={s.section}>
        <p style={s.eyebrow}>
          YOUR GETAWAY STARTS HERE
        </p>

        <h2 style={s.sectionTitle}>
          Welcome to Bali Royale
        </h2>

        <p style={{
          maxWidth: 700,
          margin: '0 auto',
          color: C.gray,
          fontSize: 15,
          lineHeight: 1.9,
        }}>
          Welcome{user ? `, ${user.firstName}` : ''}!
          {' '}Bali Royale Private Resort is an exclusive
          private resort located in Rodriguez, Rizal.
          Enjoy quality time with your loved ones,
          explore our available packages, and experience
          a relaxing getaway.
        </p>
      </section>

      {/* FEATURES */}
      <section style={{
        ...s.section,
        background: '#EEEAE3',
      }}>
        <p style={s.eyebrow}>THE BALI ROYALE EXPERIENCE</p>

        <h2 style={s.sectionTitle}>
          Why Choose Bali Royale?
        </h2>

        <div style={s.features}>
          {features.map((feature) => (
            <div key={feature.title} style={s.featureCard}>
              <div style={{
                color: C.gold,
                fontSize: 32,
                marginBottom: 20,
              }}>
                {feature.icon}
              </div>

              <h3 style={{
                fontFamily: 'Georgia, serif',
                color: C.green,
                fontSize: 21,
                marginBottom: 15,
              }}>
                {feature.title}
              </h3>

              <p style={{
                color: C.gray,
                fontSize: 14,
                lineHeight: 1.8,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={s.section}>
        <p style={s.eyebrow}>
          PLAN YOUR PERFECT ESCAPE
        </p>

        <h2 style={s.sectionTitle}>
          Your Next Getaway Awaits
        </h2>

        <p style={{
          color: C.gray,
          lineHeight: 1.8,
          marginBottom: 25,
        }}>
          Book your exclusive resort getaway with ease.
          View our packages and reserve your preferred date.
        </p>

        <Link to="/packages" style={s.goldButton}>
          View Our Packages →
        </Link>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={s.footer}>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          letterSpacing: 2,
          marginBottom: 12,
        }}>
          BALI ROYALE
        </h2>

        <p>
          Blk 15 Lot 3, Manobo Street, Phase 2,
          Amityville Subdivision,
          <br />
          Barangay San Jose, Rodriguez, Rizal
        </p>

        <p style={{
          color: '#C5A46D',
          marginTop: 20,
        }}>
          © 2026 Bali Royale Private Resort
        </p>
      </footer>

    </div>
  );
};

export default Home;
