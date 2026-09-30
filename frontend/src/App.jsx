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
import AdminDashboard from './pages/AdminDashboard';
import VerifyRegistrationPage from './pages/VerifyRegistrationPage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';

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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-festival" element={<MyFestivalPage />} />
              <Route path="/admin" element={<AdminDashboard />} />

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
