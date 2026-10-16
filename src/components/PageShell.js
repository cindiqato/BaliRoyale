import { Spin } from 'antd';

const C = {
  cream: '#F4F1EA',
  gray: '#6E5A48',
};

const PageShell = ({ loading, loadingText = 'Loading...', children }) => {
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
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '25vh',
          }}
        >
          <Spin size="large" />
          <p style={{ marginTop: 16, color: C.gray, fontSize: 14 }}>
            {loadingText}
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default PageShell;