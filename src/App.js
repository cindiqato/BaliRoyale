import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Packages from './pages/public/Packages';
import PackageDetail from './pages/public/PackageDetail';

import GuestDashboard from './pages/guest/GuestDashboard';
import NewBooking from './pages/guest/NewBooking';
import MyBookings from './pages/guest/MyBookings';
import BookingDetail from './pages/guest/BookingDetail';
import UploadPayment from './pages/guest/UploadPayment';
import Profile from './pages/guest/Profile';

import StaffDashboard from './pages/staff/StaffDashboard';
import StaffBookings from './pages/staff/StaffBookings';
import StaffPayments from './pages/staff/StaffPayments';
import StaffRequests from './pages/staff/StaffRequests';

import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />

          {/* Profile (any logged-in user) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Guest only */}
          <Route path="/guest" element={<ProtectedRoute allowedRoles={['guest']}><GuestDashboard /></ProtectedRoute>} />
          <Route path="/guest/book" element={<ProtectedRoute allowedRoles={['guest']}><NewBooking /></ProtectedRoute>} />
          <Route path="/guest/bookings" element={<ProtectedRoute allowedRoles={['guest']}><MyBookings /></ProtectedRoute>} />
          <Route path="/guest/bookings/:id" element={<ProtectedRoute allowedRoles={['guest']}><BookingDetail /></ProtectedRoute>} />
          <Route path="/guest/payments/:id" element={<ProtectedRoute allowedRoles={['guest']}><UploadPayment /></ProtectedRoute>} />

          {/* Staff (and admin) */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/bookings" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffBookings /></ProtectedRoute>} />
          <Route path="/staff/payments" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffPayments /></ProtectedRoute>} />
          <Route path="/staff/requests" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffRequests /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;