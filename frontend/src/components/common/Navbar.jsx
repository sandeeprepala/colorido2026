import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, X, Sparkles, User, LogOut, ShieldCheck, Ticket, 
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileMorphMenu from './ProfileMorphMenu';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isVolunteer, isStaff, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const allNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Campus Map', path: '/campus-map' },
    { name: 'Stalls', path: '/stalls' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Discussion', path: '/discussion' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
  ];

  // For Admin: remove Events, Stalls, Schedule, Leaderboard, Discussion
  const adminExcludedPaths = ['/events', '/stalls', '/schedule', '/leaderboard', '/discussion'];
  // For Volunteer: keep Home, Campus Map, Leaderboard, Discussion, About
  const volunteerAllowedPaths = ['/', '/campus-map', '/leaderboard', '/discussion', '/about'];

  const navLinks = isAdmin
    ? allNavLinks.filter((link) => !adminExcludedPaths.includes(link.path))
    : isVolunteer
    ? allNavLinks.filter((link) => volunteerAllowedPaths.includes(link.path))
    : allNavLinks;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b-2 border-[#121217]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Festival Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex items-center tracking-tight font-display font-black text-2xl sm:text-3xl">
              <span className="text-[#E91E63] group-hover:-translate-y-0.5 transition-transform">C</span>
              <span className="text-[#FF7A00] group-hover:-translate-y-1 transition-transform">O</span>
              <span className="text-[#19CFE8] group-hover:-translate-y-0.5 transition-transform">L</span>
              <span className="text-[#FFD43B] group-hover:-translate-y-1 transition-transform">O</span>
              <span className="text-[#8E44FF] group-hover:-translate-y-0.5 transition-transform">R</span>
              <span className="text-[#19CFE8] group-hover:-translate-y-1 transition-transform">I</span>
              <span className="text-[#7ED957] group-hover:-translate-y-0.5 transition-transform">D</span>
              <span className="text-[#E91E63] group-hover:-translate-y-1 transition-transform">O</span>
              <span className="ml-1.5 text-base sm:text-lg font-black bg-[#121217] text-white px-2 py-0.5 rounded-md -rotate-3 group-hover:rotate-0 transition-transform">
                '26
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links with Dynamic Sliding Capsule Animation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-4">
            <nav
              onMouseLeave={() => setHoveredPath(null)}
              className="relative inline-flex items-center gap-0.5 xl:gap-1 p-1 rounded-full bg-stone-200/60 border border-stone-300/80 shadow-inner"
            >
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const isHovered = hoveredPath === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredPath(link.path)}
                    className={`relative isolate ${
                      isAdmin || isVolunteer ? 'px-4 xl:px-5 py-2 text-sm' : 'px-3 xl:px-4 py-1.5 text-xs xl:text-sm'
                    } rounded-full font-black transition-colors duration-200 select-none flex items-center justify-center cursor-pointer`}
                  >
                    {/* Active sliding capsule */}
                    {active && (
                      <motion.span
                        layoutId="navbar-active-capsule"
                        className="absolute inset-0 bg-[#121217] rounded-full z-0 shadow-sm"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}

                    {/* Hover floating capsule (when not already active) */}
                    {isHovered && !active && (
                      <motion.span
                        layoutId="navbar-hover-capsule"
                        className="absolute inset-0 bg-stone-300/70 rounded-full z-0"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}

                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        active
                          ? 'text-white'
                          : isHovered
                          ? 'text-[#121217]'
                          : 'text-stone-700 hover:text-black'
                      }`}
                    >
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section / Auth Controls */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isStaff && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all hover:translate-x-0.5 hover:translate-y-0.5 ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-[#121217] text-white'
                        : isVolunteer
                        ? 'bg-[#19CFE8] hover:bg-[#0ea5e9] text-[#121217]'
                        : 'bg-[#8E44FF] hover:bg-[#7b35e2] text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isVolunteer ? 'Volunteer Portal' : 'Dashboard'}
                  </Link>
                )}

                {/* Profile Pill with Transitions.dev Spring Morph Animation */}
                <ProfileMorphMenu user={user} isAdmin={isAdmin} logout={logout} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-[#121217] hover:bg-stone-200/60 rounded-full transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#E91E63] text-white px-5 py-2 rounded-full font-bold text-sm border-2 border-[#121217] fest-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-[#121217] rounded-xl bg-white fest-shadow-sm text-[#121217]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#121217] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl font-bold text-base transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#121217] text-white shadow-sm'
                    : 'text-[#121217] hover:bg-stone-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-300 space-y-2">
            {isAuthenticated ? (
              <>
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block w-full text-center py-2.5 rounded-xl font-black border-2 border-[#121217] fest-shadow-sm flex items-center justify-center gap-1.5 ${
                      isVolunteer ? 'bg-[#19CFE8] text-[#121217]' : 'bg-[#8E44FF] text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isVolunteer ? 'Volunteer Portal' : 'Dashboard'}
                  </Link>
                )}
                {!isStaff && (
                  <Link
                    to="/my-festival"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl font-black bg-[#19CFE8] text-[#121217] border-2 border-[#121217] fest-shadow-sm"
                  >
                    🎟️ My Festival &amp; QR Pass
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full py-2 text-center text-sm font-bold text-red-600"
                >
                  Sign Out ({user?.name})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl font-bold border-2 border-[#121217] bg-white text-[#121217]"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl font-bold border-2 border-[#121217] bg-[#E91E63] text-white fest-shadow-sm"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
