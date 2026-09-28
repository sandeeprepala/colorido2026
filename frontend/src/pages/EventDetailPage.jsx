import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Trophy, Users, ShieldCheck, 
  ArrowLeft, CheckCircle2, Phone, Mail, Award, AlertCircle, Share2
} from 'lucide-react';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RegistrationModal from '../components/events/RegistrationModal';
import QRModal from '../components/common/QRModal';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getEventById(id);
      setEvent(res.data.event);
    } catch (err) {
      setError(err.response?.data?.error || 'Event could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  const handleRegisterSuccess = (registration) => {
    setShowRegModal(false);
    fetchEvent();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#121217] border-t-[#E91E63] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-bold text-stone-500 text-sm">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="font-display font-black text-2xl text-red-600">Event Not Found</p>
        <p className="text-xs font-semibold text-stone-600">{error || 'This event does not exist.'}</p>
        <Link to="/events" className="inline-block bg-[#121217] text-white text-xs font-black px-6 py-2.5 rounded-full">
          ← Back to All Events
        </Link>
      </div>
    );
  }

  const isRegistered = event.is_registered;
  const isFull = event.is_full;
  const isPastDeadline = event.registration_deadline && event.registration_deadline < new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-black text-stone-600 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events Directory
      </Link>

      {/* Hero Banner Card */}
      <div className="bg-white border-3 border-[#121217] rounded-3xl overflow-hidden fest-shadow-lg">
        
        {/* Event Cover Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-stone-900 border-b-3 border-[#121217]">
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Floating Category Pill */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="bg-[#121217] text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/20 fest-shadow-sm">
              {event.category}
            </span>
            {event.prize_pool && (
              <span className="bg-[#FFD43B] text-[#121217] px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border border-[#121217] fest-shadow-sm">
                <Trophy className="w-3.5 h-3.5" />
                {event.prize_pool}
              </span>
            )}
          </div>

          {/* Title on Banner Bottom */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight">
              {event.name}
            </h1>
            <p className="font-semibold text-stone-200 text-xs sm:text-sm mt-1 flex items-center gap-2">
              <span>{event.venue}</span>
              <span>•</span>
              <span>{event.event_date}</span>
            </p>
          </div>
        </div>

        {/* Action & Stats Strip */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-b-2 border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full md:w-auto">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Date</span>
              <p className="font-display font-black text-sm text-[#121217] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF7A00]" />
                {event.event_date}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Timing</span>
              <p className="font-display font-black text-sm text-[#121217] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8E44FF]" />
                {event.start_time} - {event.end_time}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Venue</span>
              <p className="font-display font-black text-sm text-[#121217] flex items-center gap-1.5 truncate max-w-[160px]">
                <MapPin className="w-4 h-4 text-[#E91E63]" />
                {event.venue}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Team Size</span>
              <p className="font-display font-black text-sm text-[#16A34A] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#16A34A]" />
                {Number(event.max_team_size) === 1
                  ? 'Solo (1)'
                  : `${event.min_team_size || 1} - ${event.max_team_size || 4} Members`}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Participants</span>
              <p className="font-display font-black text-sm text-[#121217] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-400" />
                {event.registered_count || 0} / {event.max_participants || 100}
              </p>
            </div>
          </div>

          {/* Registration CTA Buttons */}
          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
            {isRegistered ? (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-black text-xs sm:text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  REGISTERED ✓
                </span>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-[#121217] hover:bg-[#8E44FF] text-white px-5 py-2.5 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow-sm transition-all"
                >
                  View Entry QR Pass
                </button>
              </div>
            ) : isPastDeadline ? (
              <span className="bg-stone-200 text-stone-600 font-black text-xs sm:text-sm px-5 py-2.5 rounded-full">
                Registration Closed
              </span>
            ) : isFull ? (
              <span className="bg-amber-100 text-amber-800 font-black text-xs sm:text-sm px-5 py-2.5 rounded-full">
                Capacity Full
              </span>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setShowRegModal(true);
                  }
                }}
                className="w-full md:w-auto bg-[#E91E63] hover:bg-[#d81557] text-white px-8 py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all flex items-center justify-center gap-2"
              >
                <span>REGISTER NOW</span>
              </button>
            )}
          </div>

        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Description */}
            <div>
              <h3 className="font-display font-black text-xl text-[#121217] mb-3">
                About the Event
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Prize Money & Podium Rewards */}
            {(event.prize_1st || event.prize_2nd || event.prize_3rd || event.prize_pool) && (
              <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 border-b border-stone-200 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#FF7A00]">
                      AWARDS &amp; RECOGNITION
                    </span>
                    <h3 className="font-display font-black text-2xl text-[#121217]">
                      PRIZE MONEY &amp; PODIUM BREAKDOWN
                    </h3>
                  </div>
                  {event.prize_pool && (
                    <span className="bg-[#FFD43B] text-[#121217] px-4 py-1.5 rounded-full font-black text-xs border border-[#121217] fest-shadow-sm flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      Total Pool: {event.prize_pool}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1st Place */}
                  <div className="relative bg-gradient-to-b from-amber-50 to-amber-100/70 border-2 border-amber-400 rounded-2xl p-5 fest-shadow-sm text-center">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider border border-amber-600">
                      CHAMPION
                    </span>
                    <div className="text-3xl mb-2">🥇</div>
                    <h4 className="font-display font-black text-sm uppercase text-amber-950 mb-1">
                      1st Place
                    </h4>
                    <p className="font-display font-black text-2xl text-amber-900 mb-2">
                      {event.prize_1st || '₹10,000'}
                    </p>
                    <p className="text-[11px] font-semibold text-amber-800">
                      Gold Trophy + Official Winner Certificate + Fest Swag
                    </p>
                  </div>

                  {/* 2nd Place */}
                  <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-300 rounded-2xl p-5 fest-shadow-sm text-center">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider border border-slate-500">
                      RUNNER UP
                    </span>
                    <div className="text-3xl mb-2">🥈</div>
                    <h4 className="font-display font-black text-sm uppercase text-slate-800 mb-1">
                      2nd Place
                    </h4>
                    <p className="font-display font-black text-2xl text-slate-900 mb-2">
                      {event.prize_2nd || '₹6,000'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Silver Medal + Official Merit Certificate + Swag Pack
                    </p>
                  </div>

                  {/* 3rd Place */}
                  <div className="relative bg-gradient-to-b from-orange-50 to-orange-100/60 border-2 border-orange-300 rounded-2xl p-5 fest-shadow-sm text-center">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider border border-orange-500">
                      SECOND RUNNER UP
                    </span>
                    <div className="text-3xl mb-2">🥉</div>
                    <h4 className="font-display font-black text-sm uppercase text-orange-950 mb-1">
                      3rd Place
                    </h4>
                    <p className="font-display font-black text-2xl text-orange-950 mb-2">
                      {event.prize_3rd || '₹3,000'}
                    </p>
                    <p className="text-[11px] font-semibold text-orange-800">
                      Bronze Medal + Official Merit Certificate
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <p className="text-xs text-stone-600 font-semibold flex items-center justify-center gap-1.5">
                    <Award className="w-4 h-4 text-[#8E44FF]" />
                    <span>All official participants receive an authenticated certificate with cryptographic QR verification.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Rounds Breakdown */}
            {event.rounds && event.rounds.length > 0 && (
              <div>
                <h3 className="font-display font-black text-xl text-[#121217] mb-4">
                  Competition Rounds
                </h3>
                <div className="space-y-4">
                  {event.rounds.map((rnd, idx) => (
                    <div
                      key={rnd.id || idx}
                      className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#121217] fest-shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-base text-[#121217]">
                          {rnd.round_name}
                        </span>
                        {rnd.time && (
                          <span className="text-xs font-black bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-300">
                            {rnd.time}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {rnd.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules & Eligibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-[#121217]">
                  Rules &amp; Guidelines
                </h4>
                <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                  {event.rules || 'Standard festival event rules apply.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-[#121217]">
                  Judging Criteria
                </h4>
                <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                  {event.judging_criteria || 'Evaluation by expert panel of faculty & industry guests.'}
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Eligibility Card */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                Eligibility
              </h4>
              <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                {event.eligibility}
              </p>
            </div>

            {/* Registration Deadline Warning */}
            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300 space-y-2 text-xs">
              <span className="font-black uppercase text-stone-500 block">Registration Deadline</span>
              <p className="font-bold text-[#121217] text-sm">
                {event.registration_deadline || event.event_date}
              </p>
              <p className="text-stone-500 text-[11px]">
                Registrations close at 11:59 PM on the deadline date. Early registration is advised.
              </p>
            </div>

            {/* Coordinator Info */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#121217] fest-shadow-sm space-y-3">
              <h4 className="font-display font-black text-sm uppercase tracking-wider text-[#121217]">
                Event Coordinators
              </h4>
              <p className="text-xs font-bold text-stone-800">
                {event.contact_name}
              </p>
              <div className="space-y-1.5 text-xs text-stone-600 font-semibold">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#E91E63]" />
                  <span>{event.contact_email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>{event.contact_phone}</span>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <RegistrationModal
          event={event}
          onClose={() => setShowRegModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {/* QR Modal for already registered users */}
      {showQRModal && isRegistered && (
        <QRModal
          registration={event.user_registration}
          event={event}
          onClose={() => setShowQRModal(false)}
        />
      )}

    </div>
  );
}
