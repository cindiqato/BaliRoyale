import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center', padding: '0 20px' }}>
      <h1>Bali Royale Private Resort</h1>
      <p style={{ fontSize: '18px', color: '#555' }}>
        Exclusive private resort in Rodriguez, Rizal
      </p>

      <hr style={{ margin: '30px 0' }} />

      <h2>Welcome</h2>
      <p>
        Book your exclusive resort getaway with ease. View our packages, check
        availability, and reserve your preferred date — all online.
      </p>

      <p style={{ marginTop: '30px' }}>
        <Link to="/packages">
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            View Packages
          </button>
        </Link>
      </p>

      <hr style={{ margin: '30px 0' }} />

      <h3>Why Bali Royale?</h3>
      <p>✔️ Exclusive private resort</p>
      <p>✔️ Complete amenities for your stay</p>
      <p>✔️ Flexible schedules: Day Tour, Night Tour, 21-Hour stays</p>
      <p>✔️ Simple online booking and payment</p>

      <hr style={{ margin: '30px 0' }} />

      <p style={{ color: '#666', fontSize: '14px' }}>
        Blk 15 Lot 3, Manobo Street, Phase 2, Amityville Subdivision,<br />
        Barangay San Jose, Rodriguez, Rizal
      </p>
    </div>
  );
};

export default Home;