const C = {
  green: '#3A4D39',
  gold: '#C5A46D',
  white: '#FFFFFF',
};

const Footer = () => {
  return (
    <footer
      style={{
        background: C.green,
        color: C.white,
        textAlign: 'center',
        padding: '30px 20px',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          margin: '0 0 6px 0',
          fontFamily: 'Georgia, serif',
          letterSpacing: 2,
          fontSize: 14,
          fontWeight: 'bold',
        }}
      >
        BALI ROYALE
      </p>

      <p style={{ margin: '0 0 8px 0' }}>
        Blk 15 Lot 3, Manobo Street, Phase 2, Amityville Subdivision, Barangay San Jose, Rodriguez, Rizal
      </p>

      <p style={{ color: C.gold, margin: 0, fontSize: 11 }}>
        © 2026 Bali Royale Private Resort
      </p>
    </footer>
  );
};

export default Footer;