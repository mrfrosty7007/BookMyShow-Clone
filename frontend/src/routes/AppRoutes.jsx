import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { Home } from '../pages/Home.jsx';
import { MovieDetails } from '../pages/MovieDetails.jsx';
import { ShowDetails } from '../pages/ShowDetails.jsx';
import { BookingConfirmation } from '../pages/BookingConfirmation.jsx';
import { MyBookings } from '../pages/MyBookings.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import { AdminRoute } from '../components/AdminRoute.jsx';
import { AdminLogin } from '../pages/admin/AdminLogin.jsx';
import { AdminDashboard } from '../pages/admin/AdminDashboard.jsx';
import { Movies } from '../pages/admin/Movies.jsx';
import { Theaters } from '../pages/admin/Theaters.jsx';
import { Shows } from '../pages/admin/Shows.jsx';
import { Bookings } from '../pages/admin/Bookings.jsx';
import { TicketScanner } from '../pages/admin/TicketScanner.jsx';
import { Analytics } from '../pages/admin/Analytics.jsx';

/**
 * Centralized Application Routes with Protected Customer and Executive Admin Route Integration
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Portal Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Executive Console */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="movies" element={<Movies />} />
        <Route path="theaters" element={<Theaters />} />
        <Route path="shows" element={<Shows />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="scanner" element={<TicketScanner />} />
        <Route path="users" element={<AdminDashboard />} />
      </Route>

      {/* Main Customer Storefront */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetails />} />
        <Route path="/show/:showId" element={<ShowDetails />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking/confirmation/:bookingId"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
