import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Ticket, Calendar, MapPin, Award, Store, Mail, QrCode, 
  ExternalLink, CheckCircle2, Clock, Sparkles, User
} from 'lucide-react';
import { registrationsAPI, certificatesAPI, stallsAPI, emailAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QRModal from '../components/common/QRModal';
import CertificateModal from '../components/common/CertificateModal';

export default function MyFestivalPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [inboxEmails, setInboxEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadStudentData = async () => {
      setLoading(true);
      try {
        const [regsRes, certsRes, stallsRes, inboxRes] = await Promise.all([
          registrationsAPI.getMyRegistrations(),
          certificatesAPI.getMyCertificates(),
          stallsAPI.getMyApplications(),
          emailAPI.getMyInbox(),
        ]);

        setRegistrations(regsRes.data.registrations || []);
        setCertificates(certsRes.data.certificates || []);
        setStalls(stallsRes.data.applications || []);
        setInboxEmails(inboxRes.data.emails || []);
      } catch (err) {
        console.error('Failed to load student festival dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-[#FFFDF9] border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#E91E63] bg-pink-100 px-3 py-1 rounded-full inline-block border border-pink-200">
              STUDENT PASS &amp; PORTFOLIO
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#121217] tracking-tight">
              WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase()} 👋
            </h1>
            <p className="text-stone-600 font-semibold text-xs sm:text-sm">
              {user?.college} · {user?.department} ({user?.year})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="bg-white hover:bg-stone-100 text-[#121217] px-5 py-2.5 rounded-full font-bold text-xs border-2 border-[#121217] fest-shadow-sm transition-all"
            >
              Edit Profile
            </Link>
            <Link
              to="/events"
              className="bg-[#121217] hover:bg-[#E91E63] text-white px-5 py-2.5 rounded-full font-bold text-xs border-2 border-[#121217] fest-shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD43B]" />
              Browse More Events
            </Link>
          </div>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t-2 border-dashed border-stone-200">
          
          <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
            <span className="text-stone-500 font-bold text-[11px] uppercase block">
              Registered Events
            </span>
            <p className="font-display font-black text-3xl text-[#E91E63] mt-1">
              {registrations.length}
            </p>
          </div>

          <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
            <span className="text-stone-500 font-bold text-[11px] uppercase block">
              Active Stalls
            </span>
            <p className="font-display font-black text-3xl text-[#FF7A00] mt-1">
              {stalls.length}
            </p>
          </div>

          <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
            <span className="text-stone-500 font-bold text-[11px] uppercase block">
              Certificates
            </span>
            <p className="font-display font-black text-3xl text-[#8E44FF] mt-1">
              {certificates.length}
            </p>
          </div>

          <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
            <span className="text-stone-500 font-bold text-[11px] uppercase block">
              Festival Points
            </span>
            <p className="font-display font-black text-3xl text-[#16A34A] mt-1">
              {registrations.length * 150} pts
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 1: REGISTERED EVENTS WITH ENTRY QR PASSES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-[#121217]">
              MY REGISTERED EVENTS ({registrations.length})
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              Access your entry passes, venue details, and registration tokens
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-stone-400 font-bold text-xs">
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-8 text-center space-y-3">
            <p className="font-display font-black text-lg text-stone-800">You haven't registered for any events yet.</p>
            <p className="text-xs font-semibold text-stone-500">Explore hackathons, dance battles, cricket tournaments and join the fest!</p>
            <Link to="/events" className="inline-block bg-[#121217] text-white text-xs font-black px-6 py-2.5 rounded-full">
              Explore Festival Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-[#FFD43B] text-black px-2.5 py-0.5 rounded border border-[#121217]">
                      {reg.registration_id}
                    </span>
                    <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ Confirmed Pass
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl text-[#121217]">
                    {reg.event_name}
                  </h3>

                  <div className="space-y-1 text-xs font-semibold text-stone-600 mt-3">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>{reg.event_date || reg.event_details?.event_date} · {reg.start_time || reg.event_details?.start_time}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E91E63]" />
                      <span>{reg.venue || reg.event_details?.venue}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedReg(reg)}
                    className="bg-[#121217] hover:bg-[#E91E63] text-white text-xs font-black px-4 py-2 rounded-full border border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    VIEW QR CODE
                  </button>

                  <Link
                    to={`/events/${reg.event_id}`}
                    className="text-xs font-bold text-stone-600 hover:text-black flex items-center gap-1"
                  >
                    Event Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: OFFICIAL FESTIVAL CERTIFICATES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-[#121217]">
              MY CERTIFICATES ({certificates.length})
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              Verified digital credentials with cryptographic QR verification
            </p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-6 text-center text-xs font-semibold text-stone-500">
            Certificates will be issued by the committee upon event completion.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-[#EDE9FE] text-[#8E44FF] px-2.5 py-0.5 rounded border border-[#8E44FF]">
                      {cert.certificate_id}
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Authentic
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-[#121217]">
                    {cert.event_name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    {cert.achievement}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-400 mt-2">
                    Issued: {cert.issued_date}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="bg-[#8E44FF] hover:bg-[#7a32e6] text-white text-xs font-black px-4 py-2 rounded-full border border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    VIEW &amp; DOWNLOAD CERTIFICATE
                  </button>

                  <a
                    href={`/certificate/verify/${cert.certificate_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-stone-600 hover:text-black"
                  >
                    Public Verify
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: FESTIVAL INBOX / EMAIL LOGS */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display font-black text-2xl text-[#121217]">
            FESTIVAL INBOX &amp; NOTIFICATIONS ({inboxEmails.length})
          </h2>
          <p className="text-xs font-semibold text-stone-500">
            Official communications, venue notices, and registration receipts delivered to your account
          </p>
        </div>

        {inboxEmails.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-6 text-center text-xs font-semibold text-stone-500">
            No emails received yet.
          </div>
        ) : (
          <div className="bg-white border-2 border-[#121217] rounded-3xl divide-y divide-stone-200 fest-shadow overflow-hidden">
            {inboxEmails.map((email) => (
              <div key={email.id} className="p-4 sm:p-5 hover:bg-stone-50 transition-colors space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#E91E63]">{email.subject}</span>
                  <span className="text-stone-400">
                    {new Date(email.sent_at).toLocaleDateString()} at{' '}
                    {new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {email.body_snippet || email.subject}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedReg && (
        <QRModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
        />
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
}
