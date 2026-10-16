import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for AuthContext to finish restoring session from sessionStorage
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#F4F1EA',
        }}
      />
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;