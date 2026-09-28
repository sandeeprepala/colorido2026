import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, X, Sparkles, User, LogOut, ShieldCheck, Ticket, 
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Stalls', path: '/stalls' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Discussion', path: '/discussion' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b-2 border-[#121217]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Festival Logo */}
          <Link to="/" className="flex items-center gap-2 group">
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

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-[#121217] text-white shadow-sm'
                    : 'text-[#121217] hover:bg-stone-200/70 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section / Auth Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-[#8E44FF] hover:bg-[#7b35e2] text-white px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    👑 Admin Portal
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-white border-2 border-[#121217] px-3.5 py-1.5 rounded-full font-bold text-sm fest-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black ${
                    isAdmin ? 'bg-[#8E44FF]' : 'bg-[#E91E63]'
                  }`}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white border-2 border-[#121217] rounded-2xl p-2 fest-shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-stone-200">
                      <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                        {user?.role === 'admin' ? 'Admin Access' : 'Student Account'}
                      </p>
                      <p className="font-bold text-sm text-[#121217] truncate">{user?.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-[#8E44FF] hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/my-festival"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#E91E63]" />
                        My Festival &amp; QR Pass
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        My Profile
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-200">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                className={`block px-4 py-2.5 rounded-xl font-bold text-base ${
                  isActive(link.path)
                    ? 'bg-[#121217] text-white'
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
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl font-black bg-[#8E44FF] text-white border-2 border-[#121217] fest-shadow-sm"
                  >
                    👑 Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/my-festival"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl font-black bg-[#19CFE8] text-[#121217] border-2 border-[#121217] fest-shadow-sm"
                >
                  🎟️ My Festival &amp; QR Pass
                </Link>
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
