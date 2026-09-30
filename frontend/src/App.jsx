import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { cloudinaryAPI } from './services/api';
import { setCloudinaryCloudName } from './utils/cloudinary';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import FestivalChatbot from './components/chat/FestivalChatbot';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CampusMapPage from './pages/CampusMapPage';
import StallsPage from './pages/StallsPage';
import SchedulePage from './pages/SchedulePage';
import LeaderboardPage from './pages/LeaderboardPage';
import DiscussionPage from './pages/DiscussionPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyFestivalPage from './pages/MyFestivalPage';
import CertificatesPage from './pages/CertificatesPage';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RealTimeScannerPage from './pages/RealTimeScannerPage';
import VerifyRegistrationPage from './pages/VerifyRegistrationPage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';
import RoleRoute from './components/common/RoleRoute';

export default function App() {
  useEffect(() => {
    cloudinaryAPI.getConfig()
      .then((res) => {
        if (res.data?.cloudName) {
          setCloudinaryCloudName(res.data.cloudName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#121217]">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/campus-map" element={<CampusMapPage />} />
              <Route path="/stalls" element={<StallsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/discussion" element={<DiscussionPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated User/Volunteer/Admin Routes */}
              <Route
                path="/profile"
                element={
                  <RoleRoute allowedRoles={['user', 'volunteer', 'admin']}>
                    <ProfilePage />
                  </RoleRoute>
                }
              />
              <Route
                path="/my-festival"
                element={
                  <RoleRoute allowedRoles={['user', 'volunteer', 'admin']}>
                    <MyFestivalPage />
                  </RoleRoute>
                }
              />

              {/* Volunteer & Admin Operations Portal */}
              <Route
                path="/volunteer"
                element={
                  <RoleRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <RoleRoute allowedRoles={['volunteer', 'admin']}>
                    <RealTimeScannerPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <RoleRoute allowedRoles={['volunteer', 'admin']}>
                    <RealTimeScannerPage />
                  </RoleRoute>
                }
              />

              {/* Full Festival Administration Console */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />

              {/* Public Scanned Verification Routes */}
              <Route path="/registration/verify/:token" element={<VerifyRegistrationPage />} />
              <Route path="/certificate/verify/:certificateId" element={<VerifyCertificatePage />} />

              {/* Catch all */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          <Footer />
          <FestivalChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}
