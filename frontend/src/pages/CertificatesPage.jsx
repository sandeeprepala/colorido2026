import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, Search, ShieldCheck, Download, ExternalLink, 
  Sparkles, CheckCircle2, Calendar, User, Ticket, ArrowRight,
  Filter, QrCode
} from 'lucide-react';
import { certificatesAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CertificateModal from '../components/common/CertificateModal';

export default function CertificatesPage() {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'my-certs' : 'lookup');
  const [myCertificates, setMyCertificates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);

  // Public Search / Registry state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal
  const [selectedCert, setSelectedCert] = useState(null);

  // Fast direct verify input
  const [directVerifyId, setDirectVerifyId] = useState('');

  // Update active tab if user signs in
  useEffect(() => {
    if (isAuthenticated && activeTab === 'lookup' && !hasSearched) {
      setActiveTab('my-certs');
    }
  }, [isAuthenticated]);

  // Load user certificates & registrations
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserData = async () => {
      setLoadingMy(true);
      try {
        const [certRes, regRes] = await Promise.all([
          certificatesAPI.getMyCertificates(),
          registrationsAPI.getMyRegistrations().catch(() => ({ data: { registrations: [] } })),
        ]);
        setMyCertificates(certRes.data.certificates || []);
        setMyRegistrations(regRes.data.registrations || []);
      } catch (err) {
        console.error('Failed to load user certificates:', err);
      } finally {
        setLoadingMy(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  // Load initial registry or handle search
  useEffect(() => {
    const fetchRegistry = async () => {
      setSearching(true);
      try {
        const res = await certificatesAPI.getPublicCertificates({
          search: searchQuery.trim(),
        });
        setSearchResults(res.data.certificates || []);
        if (searchQuery.trim()) {
          setHasSearched(true);
        }
      } catch (err) {
        console.error('Failed to query public certificates:', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(fetchRegistry, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDirectVerifySubmit = (e) => {
    e.preventDefault();
    if (!directVerifyId.trim()) return;
    const cleanId = directVerifyId.trim().toUpperCase();
    window.open(`/certificate/verify/${cleanId}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Banner */}
      <div className="bg-[#FFFDF9] border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-[#8E44FF]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white bg-[#8E44FF] px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 fest-shadow-xs">
                <Award className="w-3.5 h-3.5" />
                OFFICIAL FESTIVAL CREDENTIALS
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                QR Cryptographically Verified
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#121217] tracking-tight">
              FESTIVAL CERTIFICATES
            </h1>
            <p className="text-stone-600 font-semibold text-xs sm:text-sm max-w-2xl leading-relaxed">
              Access, download, and verify authentic certificates of excellence, participation, and competition achievements issued by the COLORIDO '26 Academic &amp; Cultural Council.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            {isAuthenticated ? (
              <Link
                to="/my-festival"
                className="bg-[#121217] hover:bg-[#E91E63] text-white px-5 py-2.5 rounded-full font-black text-xs border-2 border-[#121217] fest-shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-[#FFD43B]" />
                My Festival Pass
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-[#E91E63] hover:bg-[#d81555] text-white px-5 py-2.5 rounded-full font-black text-xs border-2 border-[#121217] fest-shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In to View Your Certificates
              </Link>
            )}
          </div>
        </div>

        {/* Quick Instant Verification Box */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-stone-200">
          <form onSubmit={handleDirectVerifySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter Certificate ID to verify (e.g. CERT-COL26-88129)..."
                value={directVerifyId}
                onChange={(e) => setDirectVerifyId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#121217] rounded-xl text-xs font-bold text-[#121217] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#8E44FF]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#8E44FF] hover:bg-[#7b32e2] text-white px-6 py-2.5 rounded-xl font-black text-xs border-2 border-[#121217] fest-shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              VERIFY NOW
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b-2 border-stone-200 pb-3">
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my-certs')}
            className={`px-5 py-2 rounded-full font-black text-xs transition-all flex items-center gap-2 ${
              activeTab === 'my-certs'
                ? 'bg-[#121217] text-white fest-shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#FFD43B]" />
            My Certificates ({myCertificates.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-5 py-2 rounded-full font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'lookup'
              ? 'bg-[#121217] text-white fest-shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#19CFE8]" />
          Public Registry &amp; Student Lookup
        </button>
      </div>

      {/* TAB 1: USER'S PERSONAL CERTIFICATES */}
      {activeTab === 'my-certs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl text-[#121217]">
                YOUR ISSUED CERTIFICATES
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Official certificates awarded to {user?.name} ({user?.email})
              </p>
            </div>
          </div>

          {loadingMy ? (
            <div className="text-center py-12 text-stone-400 font-bold text-xs">
              Loading your certificates...
            </div>
          ) : myCertificates.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-purple-100 text-[#8E44FF] rounded-2xl flex items-center justify-center mx-auto border-2 border-[#121217]">
                <Award className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-xl text-[#121217]">
                  No Certificates Issued Yet
                </h3>
                <p className="text-xs font-semibold text-stone-500 max-w-md mx-auto">
                  Certificates are generated and verified by the festival coordinators once event evaluations or competitions conclude.
                </p>
              </div>

              {myRegistrations.length > 0 ? (
                <div className="pt-2">
                  <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold px-4 py-2 rounded-xl border border-amber-200">
                    You have {myRegistrations.length} registered event(s). Once marked complete, your certificates will appear here automatically!
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 bg-[#121217] hover:bg-[#E91E63] text-white px-6 py-2.5 rounded-full font-black text-xs border border-[#121217] fest-shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD43B]" />
                    Register for Events
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow flex flex-col justify-between space-y-5 hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-[#EDE9FE] text-[#8E44FF] px-2.5 py-1 rounded border border-[#8E44FF]">
                        {cert.certificate_id}
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Authentic &amp; Verified
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">
                        COMPETITION EVENT
                      </span>
                      <h3 className="font-display font-black text-xl text-[#121217]">
                        {cert.event_name}
                      </h3>
                    </div>

                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-xs">
                      <p className="font-bold text-[#8E44FF]">{cert.achievement}</p>
                      <p className="text-[11px] text-stone-500 mt-1 font-semibold">
                        Issued on: {cert.issued_date || 'October 2026'} · Signed by: {cert.organizer_signature || 'Festival Conveners'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="bg-[#8E44FF] hover:bg-[#7931df] text-white text-xs font-black px-4 py-2.5 rounded-full border border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-3.5 h-3.5" />
                      VIEW &amp; DOWNLOAD (PDF)
                    </button>

                    <a
                      href={`/certificate/verify/${cert.certificate_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-stone-600 hover:text-black flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-full border border-stone-300 transition-colors"
                    >
                      Public Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLIC REGISTRY & STUDENT LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-[#121217]">
                PUBLIC CERTIFICATES REGISTRY
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Search authentic credentials by Certificate ID, Student Name, or College Email
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by ID, Name, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#121217] rounded-xl text-xs font-bold text-[#121217] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#8E44FF]"
              />
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="text-xs text-amber-900 font-semibold">
                Are you a participant? Sign in to immediately see all certificates registered to your account.
              </div>
              <Link
                to="/login"
                className="bg-[#121217] text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-[#E91E63] transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {searching ? (
            <div className="text-center py-10 text-stone-400 font-bold text-xs">
              Searching certificate registry...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-10 text-center space-y-2">
              <Award className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-display font-black text-lg text-stone-700">
                {searchQuery ? `No certificates matching "${searchQuery}"` : 'No certificates found in the registry.'}
              </p>
              <p className="text-xs text-stone-500 font-semibold">
                Try checking the spelling of the student name or certificate ID.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white border-2 border-[#121217] rounded-3xl p-5 fest-shadow flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold bg-[#EDE9FE] text-[#8E44FF] px-2 py-0.5 rounded border border-[#8E44FF]">
                        {cert.certificate_id}
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base text-[#121217] truncate">
                        {cert.participant_name}
                      </h4>
                      <p className="text-xs font-bold text-[#E91E63] truncate">
                        {cert.event_name}
                      </p>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 font-medium">
                      {cert.achievement}
                    </p>

                    <p className="text-[10px] font-bold text-stone-400">
                      Issued: {cert.issued_date}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="bg-[#121217] hover:bg-[#8E44FF] text-white text-[11px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-all"
                    >
                      <Award className="w-3 h-3" />
                      View Certificate
                    </button>

                    <a
                      href={`/certificate/verify/${cert.certificate_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-stone-600 hover:text-black flex items-center gap-1"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
}
