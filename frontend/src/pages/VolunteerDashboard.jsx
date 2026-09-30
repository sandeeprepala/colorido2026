import React, { useState, useEffect } from 'react';
import { 
  QrCode, Users, Trophy, CheckCircle2, AlertCircle, Search, 
  RefreshCw, Check, ArrowRight, Clock, MapPin, Building,
  ShieldAlert, Sparkles, Filter, ExternalLink, Maximize2
} from 'lucide-react';
import { registrationsAPI, volunteerAPI, eventsAPI, leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import RealTimeQRScanner from '../components/scanner/RealTimeQRScanner';
import { Link } from 'react-router-dom';

export default function VolunteerDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'attendees' | 'sports'
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  // 1. QR Check-In state
  const [checkinInput, setCheckinInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(null);
  const [checkinError, setCheckinError] = useState('');

  // 2. Attendees Roster state
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // 3. Sports Leaderboards state
  const [leaderboards, setLeaderboards] = useState([]);
  const [selectedLbId, setSelectedLbId] = useState('');
  const [editingScores, setEditingScores] = useState({});

  // Realtime updates for sports scores
  useRealtime({
    LEADERBOARD_UPDATED: (updated) => {
      setLeaderboards((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
    },
  });

  // Load initial data
  useEffect(() => {
    fetchEvents();
    fetchAttendees();
    fetchLeaderboards();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      console.warn('Failed to load events:', err);
    }
  };

  const fetchAttendees = async () => {
    setLoadingAttendees(true);
    try {
      const res = await volunteerAPI.getAttendees({
        eventId: selectedEventId,
        search: searchQuery,
      });
      setAttendees(res.data.attendees || []);
    } catch (err) {
      console.warn('Failed to load attendee roster:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [selectedEventId, searchQuery]);

  const fetchLeaderboards = async () => {
    try {
      const res = await leaderboardAPI.getAllLeaderboards();
      const list = res.data.leaderboards || [];
      setLeaderboards(list);
      if (list.length > 0 && !selectedLbId) {
        setSelectedLbId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load leaderboards:', err);
    }
  };

  // --- TAB 1: QR CHECK-IN ---
  const handleVerifyPass = async (e) => {
    if (e) e.preventDefault();
    const token = checkinInput.trim();
    if (!token) return;

    setVerifying(true);
    setCheckinError('');
    setCheckinSuccess(null);
    setVerifiedPass(null);

    try {
      const res = await registrationsAPI.verifyQrToken(token);
      setVerifiedPass(res.data);
    } catch (err) {
      setCheckinError(err.response?.data?.error || 'Invalid QR code or registration ID.');
    } finally {
      setVerifying(false);
    }
  };

  const handleMarkAttended = async (passIdOrToken) => {
    const identifier = passIdOrToken || verifiedPass?.id || verifiedPass?.qr_token || checkinInput;
    if (!identifier) return;

    setLoading(true);
    setCheckinError('');
    try {
      const res = await volunteerAPI.checkIn({ token: identifier });
      const data = res.data;

      setCheckinSuccess({
        participant_name: data.participant_name || verifiedPass?.participant_name,
        event_name: data.event_name || verifiedPass?.event_name,
        registration_id: data.registration_id || verifiedPass?.registration_id,
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        alreadyAttended: !!data.alreadyAttended,
      });

      if (verifiedPass) {
        setVerifiedPass((prev) => ({ ...prev, status: 'attended' }));
      }

      // Refresh attendee list if open
      fetchAttendees();
    } catch (err) {
      setCheckinError(err.response?.data?.error || 'Failed to record attendance.');
    } finally {
      setLoading(false);
    }
  };

  // --- TAB 2: ROSTER DIRECT CHECK-IN ---
  const handleRosterCheckIn = async (regId) => {
    try {
      await volunteerAPI.updateRegistrationStatus(regId, { status: 'attended' });
      setNotice({ type: 'success', message: 'Attendance recorded successfully!' });
      setTimeout(() => setNotice({ type: '', message: '' }), 4000);
      fetchAttendees();
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.error || 'Failed to update attendance.' });
      setTimeout(() => setNotice({ type: '', message: '' }), 4000);
    }
  };

  // --- TAB 3: SPORTS SCORING ---
  const selectedLeaderboard = leaderboards.find((b) => b.id === selectedLbId) || leaderboards[0];

  const handleMatchStatusChange = async (newStatus) => {
    if (!selectedLeaderboard) return;
    try {
      await volunteerAPI.updateMatchStatus(selectedLeaderboard.id, {
        status: newStatus,
        match_info: selectedLeaderboard.match_info,
      });
      fetchLeaderboards();
      setNotice({ type: 'success', message: `Match status updated to ${newStatus}` });
      setTimeout(() => setNotice({ type: '', message: '' }), 3000);
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to update match status.' });
    }
  };

  const handleScoreChange = (entryId, field, value) => {
    setEditingScores((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [field]: value,
      },
    }));
  };

  const handleSaveTeamScore = async (entry) => {
    if (!selectedLeaderboard) return;
    const currentEdits = editingScores[entry.id] || {};
    const updatedScore = currentEdits.score !== undefined ? currentEdits.score : entry.score;
    const updatedPoints = currentEdits.points !== undefined ? currentEdits.points : entry.points;

    try {
      await volunteerAPI.saveMatchEntry(selectedLeaderboard.id, {
        entryId: entry.id,
        team_name: entry.team_name,
        participant_name: entry.participant_name,
        score: updatedScore,
        points: updatedPoints,
        form: entry.form,
      });
      fetchLeaderboards();
      setNotice({ type: 'success', message: `Score saved for ${entry.team_name}` });
      setTimeout(() => setNotice({ type: '', message: '' }), 3000);
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to update team score.' });
    }
  };

  const handleAdjustPoints = async (entry, delta) => {
    if (!selectedLeaderboard) return;
    try {
      await volunteerAPI.adjustMatchPoints(selectedLeaderboard.id, entry.id, {
        delta,
      });
      fetchLeaderboards();
    } catch (err) {
      console.warn('Failed to adjust points:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header Banner */}
      <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#19CFE8] text-[#121217] font-black text-xs px-3 py-1 rounded-full border border-[#121217] uppercase tracking-wider">
              Festival Operations Portal
            </span>
            <span className="bg-[#FAF8F5] text-stone-600 font-bold text-xs px-3 py-1 rounded-full border border-stone-300">
              Role: <strong className="text-[#8E44FF] uppercase">{user?.role || 'volunteer'}</strong>
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#121217] tracking-tight">
            Volunteer Control Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-1">
            Gate QR verification, attendee check-in rosters, and live sports match scoring.
          </p>
        </div>

        {/* Quick Tabs Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#FAF8F5] rounded-2xl border-2 border-[#121217] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'checkin'
                ? 'bg-[#121217] text-white shadow-sm'
                : 'text-stone-700 hover:text-black'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Check-In
          </button>

          <button
            onClick={() => setActiveTab('attendees')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'attendees'
                ? 'bg-[#121217] text-white shadow-sm'
                : 'text-stone-700 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            Attendee Roster
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'sports'
                ? 'bg-[#121217] text-white shadow-sm'
                : 'text-stone-700 hover:text-black'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Sports Scoring
          </button>
        </div>
      </div>

      {/* Global Alert Notice */}
      {notice.message && (
        <div
          className={`p-4 rounded-2xl border-2 border-[#121217] font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200 ${
            notice.type === 'error'
              ? 'bg-rose-100 text-rose-900 border-rose-400'
              : 'bg-emerald-100 text-emerald-900 border-emerald-400'
          }`}
        >
          {notice.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: QR CHECK-IN */}
      {/* ========================================================================= */}
      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF8F5] border-2 border-[#121217] rounded-2xl px-4 py-2.5">
            <p className="text-xs font-bold text-stone-600">
              Live webcam & mobile camera scanner. Real-time participant verification and gate attendance.
            </p>
            <Link
              to="/scanner"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#8E44FF] hover:underline"
            >
              <span>Open Dedicated Kiosk Scanner</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RealTimeQRScanner
            onAttendanceMarked={fetchAttendees}
            autoCheckInDefault={false}
            showHistory={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: EVENT PARTICIPANTS ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'attendees' && (
        <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-xl text-[#121217]">
                Festival Attendee Roster
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Operational participant checklist filtered by event
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Event Filter */}
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-4 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-bold focus:outline-hidden pr-8 cursor-pointer"
                >
                  <option value="all">All Events ({events.length})</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search participant, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-bold pl-8 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-3" />
              </div>

              <button
                onClick={fetchAttendees}
                className="p-2.5 border-2 border-[#121217] rounded-xl bg-white hover:bg-stone-100 fest-shadow-sm"
                title="Refresh list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto border-2 border-[#121217] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b-2 border-[#121217] font-black uppercase text-stone-600">
                <tr>
                  <th className="p-3.5">Reg ID</th>
                  <th className="p-3.5">Participant</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {loadingAttendees ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 font-bold text-stone-400">
                      Loading attendee list...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 font-bold text-stone-400">
                      No matching participants found.
                    </td>
                  </tr>
                ) : (
                  attendees.map((att) => (
                    <tr key={att.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#8E44FF]">
                        {att.registration_id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#121217]">{att.student_name}</div>
                        <div className="text-[10px] text-stone-400">{att.student_email}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-stone-800">
                        {att.event_name}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        <div>{att.college || '—'}</div>
                        {att.department && (
                          <div className="text-[10px] text-stone-400">{att.department}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            att.status === 'attended'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : att.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 border-rose-400'
                              : 'bg-amber-100 text-amber-800 border-amber-400'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {att.status === 'confirmed' ? (
                          <button
                            onClick={() => handleRosterCheckIn(att.id)}
                            className="bg-[#7ED957] hover:bg-[#6ec24a] text-[#121217] px-3 py-1.5 rounded-full font-black text-[11px] border border-[#121217] fest-shadow-sm transition-all"
                          >
                            Mark Attended
                          </button>
                        ) : att.status === 'attended' ? (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            ✓ Attended
                          </span>
                        ) : (
                          <span className="text-stone-400 font-bold text-[11px]">
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SPORTS LIVE SCORING */}
      {/* ========================================================================= */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {/* Tournament Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {leaderboards.map((lb) => (
              <button
                key={lb.id}
                onClick={() => setSelectedLbId(lb.id)}
                className={`px-4 py-2 rounded-2xl font-black text-xs whitespace-nowrap border-2 border-[#121217] transition-all ${
                  selectedLeaderboard?.id === lb.id
                    ? 'bg-[#8E44FF] text-white fest-shadow'
                    : 'bg-white text-[#121217] hover:bg-stone-100'
                }`}
              >
                {lb.sport_name}
                <span
                  className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    lb.status === 'LIVE'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : lb.status === 'COMPLETED'
                      ? 'bg-stone-300 text-stone-800'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  {lb.status}
                </span>
              </button>
            ))}
          </div>

          {selectedLeaderboard ? (
            <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-6">
              {/* Header with Match Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#8E44FF] uppercase tracking-wider">
                      Live Tournament Scoring
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        selectedLeaderboard.status === 'LIVE'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : selectedLeaderboard.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-400 text-black'
                      }`}
                    >
                      {selectedLeaderboard.status}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-[#121217]">
                    {selectedLeaderboard.sport_name}
                  </h3>
                  <p className="text-xs font-semibold text-stone-500">
                    {selectedLeaderboard.match_info || 'Live Match Desk'}
                  </p>
                </div>

                {/* Match Status Toggles for Volunteer */}
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border-2 border-[#121217]">
                  <span className="text-[10px] font-black uppercase text-stone-500 px-2">Status:</span>
                  <button
                    onClick={() => handleMatchStatusChange('UPCOMING')}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      selectedLeaderboard.status === 'UPCOMING'
                        ? 'bg-[#121217] text-white'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => handleMatchStatusChange('LIVE')}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      selectedLeaderboard.status === 'LIVE'
                        ? 'bg-rose-600 text-white'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    LIVE 🔥
                  </button>
                  <button
                    onClick={() => handleMatchStatusChange('COMPLETED')}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      selectedLeaderboard.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Participating Teams & Scoring Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
                  Participating Teams & Scores
                </h4>

                {(!selectedLeaderboard.entries || selectedLeaderboard.entries.length === 0) ? (
                  <div className="text-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 font-bold text-xs">
                    No teams registered or added to this match yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLeaderboard.entries.map((entry) => {
                      const currentScore =
                        editingScores[entry.id]?.score !== undefined
                          ? editingScores[entry.id].score
                          : entry.score;
                      const currentPoints =
                        editingScores[entry.id]?.points !== undefined
                          ? editingScores[entry.id].points
                          : entry.points;

                      return (
                        <div
                          key={entry.id}
                          className="bg-[#FAF8F5] border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-display font-black text-base text-[#121217]">
                                {entry.team_name}
                              </h5>
                              <p className="text-[11px] font-semibold text-stone-500">
                                {entry.participant_name}
                              </p>
                            </div>
                            <span className="font-mono font-black text-sm bg-[#FFD43B] text-black px-2 py-0.5 rounded border border-[#121217]">
                              {entry.points} pts
                            </span>
                          </div>

                          {/* Editable Score Inputs */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] font-black uppercase text-stone-500 block mb-0.5">
                                Score Text
                              </label>
                              <input
                                type="text"
                                value={currentScore}
                                onChange={(e) =>
                                  handleScoreChange(entry.id, 'score', e.target.value)
                                }
                                placeholder="e.g. 3 goals / 42 runs"
                                className="w-full px-3 py-1.5 bg-white border border-[#121217] rounded-xl font-bold text-xs focus:outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-stone-500 block mb-0.5">
                                Points
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={currentPoints}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      entry.id,
                                      'points',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1.5 bg-white border border-[#121217] rounded-xl font-mono font-bold text-xs focus:outline-hidden text-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAdjustPoints(entry, 1)}
                                  className="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg font-black text-xs border border-stone-400"
                                  title="Add 1 point"
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Save Score Button */}
                          <button
                            onClick={() => handleSaveTeamScore(entry)}
                            className="w-full bg-[#121217] hover:bg-[#8E44FF] text-white py-2 rounded-xl font-black text-xs uppercase tracking-wider border border-[#121217] transition-colors"
                          >
                            Save Score
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border-3 border-[#121217] font-bold text-stone-400">
              No leaderboards available.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
