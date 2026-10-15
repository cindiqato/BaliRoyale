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
        padding: '36px 20px',
        fontSize: 13,
        lineHeight: 1.8,
        marginTop: 40,
      }}
    >
      <h2
        style={{
          fontFamily: 'Georgia, serif',
          letterSpacing: 2,
          marginBottom: 12,
          color: C.white,
          fontSize: 20,
        }}
      >
        BALI ROYALE
      </h2>

      <p style={{ margin: '0 0 6px 0' }}>
        Blk 15 Lot 3, Manobo Street, Phase 2, Amityville Subdivision
      </p>
      <p style={{ margin: '0 0 12px 0' }}>
        Barangay San Jose, Rodriguez, Rizal
      </p>

      <p style={{ color: C.gold, margin: 0 }}>
        © 2026 Bali Royale Private Resort
      </p>
    </footer>
  );
};

export default Footer;