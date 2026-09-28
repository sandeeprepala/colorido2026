import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, Calendar, Ticket, Store, Trophy, Mail, 
  Award, MessageSquare, Plus, Trash2, Edit3, CheckCircle2, 
  XCircle, Download, Send, Search, RefreshCw, AlertCircle, Eye, ArrowUpRight,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { 
  adminAPI, eventsAPI, registrationsAPI, stallsAPI, 
  leaderboardAPI, certificatesAPI, emailAPI, discussionAPI 
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import StallMap from '../components/stalls/StallMap';
import CertificateModal from '../components/common/CertificateModal';
import FoodStreetBoulevard from '../components/stalls/admin/FoodStreetBoulevard';
import CarnivalGameArena from '../components/stalls/admin/CarnivalGameArena';
import StallApplicationsRegistry from '../components/stalls/admin/StallApplicationsRegistry';
import FestivalStallLots from '../components/stalls/admin/FestivalStallLots';
import StallAdminSidebar from '../components/stalls/admin/StallAdminSidebar';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, events, stalls, registrations, leaderboard, certificates, email, discussion
  const [stallSection, setStallSection] = useState('food'); // food, game, applications, all-lots, view-all
  const [isStallSidebarOpen, setIsStallSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [stallApps, setStallApps] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  // Modals & form state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    category: 'technical',
    description: '',
    image_url: '',
    venue: '',
    event_date: '2026-10-18',
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    registration_deadline: '2026-10-16',
    max_participants: 100,
    prize_pool: '₹25,000',
    prize_1st: '₹12,000',
    prize_2nd: '₹8,000',
    prize_3rd: '₹5,000',
    min_team_size: 1,
    max_team_size: 1,
    eligibility: 'All undergraduate students with valid college ID',
    rules: '',
    judging_criteria: '',
    contact_name: 'Dr. Anita Roy',
    contact_email: 'fest@colorido.college.edu',
    contact_phone: '+91 98765 43210',
    rounds: [{ round_order: 1, round_name: 'Round 1: Screening', description: '', time: '10:00 AM' }],
  });

  // Email form state
  const [emailTargetEvent, setEmailTargetEvent] = useState('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  // Leaderboard edit state
  const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
  const [editingScoreEntry, setEditingScoreEntry] = useState(null); // { id, points, score }

  // Certificate generation state
  const [certTargetEvent, setCertTargetEvent] = useState('');
  const [certAchievement, setCertAchievement] = useState('Official Certificate of Excellence & Participation');
  const [certGenerating, setCertGenerating] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [certSearch, setCertSearch] = useState('');

  // Registration filters
  const [regEventFilter, setRegEventFilter] = useState('all');
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [regSearch, setRegSearch] = useState('');

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes, eventsRes, stallsRes, appsRes, 
        regsRes, lbRes, emailsRes, discRes, certsRes
      ] = await Promise.all([
        adminAPI.getStats(),
        eventsAPI.getEvents(),
        stallsAPI.getStalls(),
        stallsAPI.getAdminApplications(),
        registrationsAPI.getAdminRegistrations(),
        leaderboardAPI.getAllLeaderboards(),
        emailAPI.getEmailLogs(),
        discussionAPI.getDiscussion(),
        certificatesAPI.getAdminCertificates().catch(() => ({ data: { certificates: [] } })),
      ]);

      setStats(statsRes.data.stats);
      setEvents(eventsRes.data.events || []);
      setStalls(stallsRes.data.stalls || []);
      setStallApps(appsRes.data.applications || []);
      setRegistrations(regsRes.data.registrations || []);
      setLeaderboards(lbRes.data.leaderboards || []);
      setCertificates(certsRes.data.certificates || []);
      setEmailLogs(emailsRes.data.logs || []);
      setDiscussions(discRes.data.messages || []);

      const fetchedLbs = lbRes.data.leaderboards || [];
      setLeaderboards(fetchedLbs);
      if (fetchedLbs.length > 0) {
        if (!selectedLeaderboard) {
          setSelectedLeaderboard(fetchedLbs[0]);
        } else {
          const fresh = fetchedLbs.find((b) => b.id === selectedLeaderboard.id);
          if (fresh) {
            setSelectedLeaderboard(fresh);
          } else {
            setSelectedLeaderboard(fetchedLbs[0]);
          }
        }
      }

      if (eventsRes.data.events?.length > 0 && !certTargetEvent) {
        setCertTargetEvent(eventsRes.data.events[0].id);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/my-festival');
      return;
    }
    fetchAllAdminData();
  }, [isAuthenticated, isAdmin]);

  // Realtime updates
  useRealtime({
    STALL_UPDATED: () => {
      stallsAPI.getStalls().then((res) => setStalls(res.data.stalls || []));
      stallsAPI.getAdminApplications().then((res) => setStallApps(res.data.applications || []));
    },
    LEADERBOARD_UPDATED: (updated) => {
      setLeaderboards((prev) => {
        const exists = prev.some((b) => b.id === updated.id);
        if (exists) {
          return prev.map((b) => (b.id === updated.id ? updated : b));
        }
        return [...prev, updated];
      });
      if (selectedLeaderboard?.id === updated.id) {
        setSelectedLeaderboard(updated);
      }
    },
    LEADERBOARD_DELETED: ({ id }) => {
      setLeaderboards((prev) => prev.filter((b) => b.id !== id && b.event_id !== id));
      if (selectedLeaderboard?.id === id || selectedLeaderboard?.event_id === id) {
        setSelectedLeaderboard(null);
      }
    },
  });

  const notify = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // 1. EVENT MANAGEMENT ACTIONS
  const handleOpenCreateEvent = (defaultCategory = 'technical') => {
    setEditingEvent(null);
    setEventFormData({
      name: '',
      category: defaultCategory,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      venue: '',
      event_date: '2026-10-18',
      start_time: '10:00 AM',
      end_time: '04:00 PM',
      registration_deadline: '2026-10-16',
      max_participants: 100,
      prize_pool: '₹25,000',
      prize_1st: '₹12,000',
      prize_2nd: '₹8,000',
      prize_3rd: '₹5,000',
      min_team_size: 1,
      max_team_size: 1,
      eligibility: 'Open to all enrolled students with college ID',
      rules: '• Valid college ID is mandatory.\n• Respect tournament schedule timings.',
      judging_criteria: 'Technical performance & judges final review',
      contact_name: 'Dr. Anita Roy',
      contact_email: 'events@colorido.fest',
      contact_phone: '+91 98765 43210',
      rounds: [
        { round_order: 1, round_name: 'Round 1: Screening Qualifier', description: 'Initial screening test.', time: '10:00 AM - 11:30 AM' },
        { round_order: 2, round_name: 'Round 2: Grand Finals', description: 'Top contingents clash for podium medals.', time: '01:30 PM - 03:30 PM' },
      ],
    });
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (evt) => {
    setEditingEvent(evt);
    setEventFormData({
      name: evt.name,
      category: evt.category,
      description: evt.description,
      image_url: evt.image_url,
      venue: evt.venue,
      event_date: evt.event_date,
      start_time: evt.start_time,
      end_time: evt.end_time,
      registration_deadline: evt.registration_deadline,
      max_participants: evt.max_participants,
      prize_pool: evt.prize_pool || '',
      prize_1st: evt.prize_1st || '',
      prize_2nd: evt.prize_2nd || '',
      prize_3rd: evt.prize_3rd || '',
      min_team_size: Number(evt.min_team_size) || 1,
      max_team_size: Number(evt.max_team_size) || 1,
      eligibility: evt.eligibility,
      rules: evt.rules,
      judging_criteria: evt.judging_criteria,
      contact_name: evt.contact_name,
      contact_email: evt.contact_email,
      contact_phone: evt.contact_phone,
      rounds: evt.rounds || [],
    });
    setShowEventModal(true);
  };

  const handleAddRound = () => {
    const nextOrder = eventFormData.rounds.length + 1;
    setEventFormData({
      ...eventFormData,
      rounds: [
        ...eventFormData.rounds,
        { round_order: nextOrder, round_name: `Round ${nextOrder}`, description: '', time: '' },
      ],
    });
  };

  const handleRemoveRound = (idx) => {
    setEventFormData({
      ...eventFormData,
      rounds: eventFormData.rounds.filter((_, i) => i !== idx),
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventsAPI.updateEvent(editingEvent.id, eventFormData);
        notify(`Event "${eventFormData.name}" updated successfully!`);
      } else {
        await eventsAPI.createEvent(eventFormData);
        notify(`New event "${eventFormData.name}" created!`);
      }
      setShowEventModal(false);
      fetchAllAdminData();

      // If a sports event was created or updated, auto-select it in the Sports Leaderboard
      if (eventFormData.category?.toLowerCase() === 'sports') {
        leaderboardAPI.getAllLeaderboards().then((lbRes) => {
          const matched = lbRes.data.leaderboards?.find(
            (lb) => lb.sport_name?.toLowerCase() === eventFormData.name?.toLowerCase()
          );
          if (matched) {
            setSelectedLeaderboard(matched);
          }
        }).catch(() => {});
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save event';
      alert(errMsg);
    }
  };

  const handleDeleteEvent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to cancel and delete "${name}"?`)) return;
    try {
      await eventsAPI.deleteEvent(id);
      notify(`Event "${name}" deleted.`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  // 2. STALL APPLICATION REVIEW ACTIONS
  const handleReviewStall = async (appId, action) => {
    try {
      const res = await stallsAPI.reviewApplication(appId, { action });
      notify(`Stall application ${action === 'approve' ? 'APPROVED' : 'REJECTED'}. Notification email dispatched!`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update stall application');
    }
  };

  const handleToggleStallStatus = async (stallId, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'occupied' : 'available';
    try {
      await stallsAPI.updateStallAdmin(stallId, { status: nextStatus });
      notify(`Stall ${stallId} is now marked ${nextStatus.toUpperCase()}!`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update stall status');
    }
  };

  // 3. REGISTRATION STATUS ACTIONS (CHECK-IN / ATTENDANCE)
  const handleUpdateRegStatus = async (regId, status) => {
    try {
      await registrationsAPI.updateRegistrationStatus(regId, { status });
      notify(`Registration marked as ${status.toUpperCase()}!`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update registration status');
    }
  };

  // 3. LEADERBOARD EDIT ACTIONS
  const handleUpdateMatchStatus = async (status) => {
    if (!selectedLeaderboard) return;
    try {
      const res = await leaderboardAPI.updateStatus(selectedLeaderboard.id, { status });
      setSelectedLeaderboard(res.data.leaderboard);
      notify(`Status changed to ${status}`);
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };


  const handleDeleteEntry = async (entryId) => {
    if (!selectedLeaderboard) return;
    try {
      const res = await leaderboardAPI.deleteEntry(selectedLeaderboard.id, entryId);
      setSelectedLeaderboard(res.data.leaderboard);
      notify('Team entry removed.');
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  const handleQuickAdjustPoints = async (boardId, entryId, delta) => {
    try {
      const res = await leaderboardAPI.adjustPoints(boardId, entryId, { delta });
      setSelectedLeaderboard(res.data.leaderboard);
      notify(`Updated team points (${delta > 0 ? '+' + delta : delta} pts) & broadcast live!`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to adjust points');
    }
  };

  const handleSaveDirectPoints = async (boardId, entryId, newPoints, newScore) => {
    try {
      const res = await leaderboardAPI.adjustPoints(boardId, entryId, {
        points: Number(newPoints),
        score: newScore,
      });
      setSelectedLeaderboard(res.data.leaderboard);
      setEditingScoreEntry(null);
      notify('Team points & score updated and broadcast live!');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save points');
    }
  };

  // 4. CERTIFICATES ACTIONS
  const handleGenerateAllCerts = async () => {
    if (!certTargetEvent) return;
    setCertGenerating(true);
    try {
      const res = await certificatesAPI.generateCertificates({
        event_id: certTargetEvent,
        participant_id: 'all',
        achievement: certAchievement,
      });
      notify(`✓ Generated & emailed ${res.data.count} certificates!`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate certificates');
    } finally {
      setCertGenerating(false);
    }
  };

  // 5. EMAIL BROADCAST ACTIONS
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!emailSubject || !emailMessage) return;
    setEmailSending(true);
    try {
      const res = await emailAPI.sendBroadcast({
        event_id: emailTargetEvent,
        subject: emailSubject,
        message: emailMessage,
      });
      notify(`✓ ${res.data.message}`);
      setEmailSubject('');
      setEmailMessage('');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setEmailSending(false);
    }
  };

  // 6. CSV EXPORT FOR REGISTRATIONS
  const handleExportCSV = () => {
    const headers = ['Registration ID,Event,Student Name,Email,Phone,College,Department,Status,Date'];
    const rows = registrations.map((r) =>
      `"${r.registration_id}","${r.event_name}","${r.student_name}","${r.student_email}","${r.student_phone || ''}","${r.college}","${r.department || ''}","${r.status}","${r.registered_at}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `colorido26_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Discussion moderation
  const handleDeleteDiscussion = async (id) => {
    try {
      await discussionAPI.deleteMessage(id);
      notify('Discussion message removed.');
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to remove message');
    }
  };

  // Filter registrations
  const filteredRegs = registrations
    .filter((r) => regEventFilter === 'all' || r.event_id === regEventFilter)
    .filter((r) => regStatusFilter === 'all' || r.status === regStatusFilter)
    .filter(
      (r) =>
        !regSearch.trim() ||
        r.student_name?.toLowerCase().includes(regSearch.toLowerCase()) ||
        r.student_email?.toLowerCase().includes(regSearch.toLowerCase()) ||
        r.college?.toLowerCase().includes(regSearch.toLowerCase()) ||
        r.registration_id?.toLowerCase().includes(regSearch.toLowerCase())
    );

  // Filter certificates
  const filteredCerts = certificates.filter(
    (c) =>
      !certSearch.trim() ||
      c.participant_name?.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.participant_email?.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.certificate_id?.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.event_name?.toLowerCase().includes(certSearch.toLowerCase())
  );

  const targetEventRecipientsCount = emailTargetEvent === 'all'
    ? registrations.length
    : registrations.filter((r) => r.event_id === emailTargetEvent).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#8E44FF] text-white fest-shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#8E44FF]">
              FESTIVAL CONTROL CONSOLE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#121217] tracking-tight">
            ADMIN DASHBOARD
          </h1>
          <p className="text-xs font-semibold text-stone-500 mt-1">
            COLORIDO '26 Management · Superuser: {user?.name}
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCreateEvent}
            className="bg-[#121217] hover:bg-[#E91E63] text-white px-4 py-2.5 rounded-full text-xs font-black border-2 border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            CREATE EVENT
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className="bg-[#FF7A00] hover:bg-[#e06c00] text-white px-4 py-2.5 rounded-full text-xs font-black border-2 border-[#121217] fest-shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-4 h-4" />
            SEND EMAIL
          </button>
          <button
            onClick={fetchAllAdminData}
            title="Refresh All Data"
            className="p-2.5 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-black flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 sm:gap-2 bg-white p-2 rounded-2xl border-2 border-[#121217] fest-shadow-sm text-xs font-black overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'events', label: `🎪 Events (${events.length})` },
          { id: 'stalls', label: `🍔 Stalls (${stalls.length})` },
          { id: 'registrations', label: `🎟️ Registrations (${registrations.length})` },
          { id: 'leaderboard', label: '🏆 Sports Leaderboard' },
          { id: 'certificates', label: `📜 Certificates (${certificates.length})` },
          { id: 'email', label: '✉️ Email Broadcast' },
          { id: 'discussion', label: `💬 Discussion (${discussions.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl whitespace-nowrap transition-all flex-1 text-center shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#121217] text-white fest-shadow-sm'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & KEY METRICS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* System & Database Infrastructure Status */}
          <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Database: <strong className="text-[#121217]">PostgreSQL (Supabase Live)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8E44FF]"></span>
                <span>Realtime SSE: <strong className="text-[#121217]">Broadcasting Active</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></span>
                <span>Prize Money Configured: <strong className="text-[#FF7A00]">1st, 2nd, 3rd break down on all 16 events</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('events')}
                className="bg-stone-100 hover:bg-stone-200 text-[#121217] px-3 py-1.5 rounded-xl text-xs font-black border border-stone-300"
              >
                🎪 Events
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className="bg-stone-100 hover:bg-stone-200 text-[#121217] px-3 py-1.5 rounded-xl text-xs font-black border border-stone-300"
              >
                🎟️ Attendance
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className="bg-stone-100 hover:bg-stone-200 text-[#121217] px-3 py-1.5 rounded-xl text-xs font-black border border-stone-300"
              >
                📜 Certificates
              </button>
            </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Total Students</span>
              <p className="font-display font-black text-3xl text-[#121217] mt-1">
                {stats?.total_students || 0}
              </p>
            </div>

            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Total Events</span>
              <p className="font-display font-black text-3xl text-[#8E44FF] mt-1">
                {stats?.total_events || 0}
              </p>
            </div>

            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Registrations</span>
              <p className="font-display font-black text-3xl text-[#E91E63] mt-1">
                {stats?.total_registrations || 0}
              </p>
            </div>

            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Stall Applications</span>
              <p className="font-display font-black text-3xl text-[#FF7A00] mt-1">
                {stats?.stall_applications || 0}
              </p>
            </div>

            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Approved Stalls</span>
              <p className="font-display font-black text-3xl text-[#16A34A] mt-1">
                {stats?.approved_stalls || 0}
              </p>
            </div>

            <div className="bg-white border-2 border-[#121217] rounded-2xl p-4 fest-shadow-sm">
              <span className="text-[10px] font-black uppercase text-stone-500">Pending Review</span>
              <p className="font-display font-black text-3xl text-amber-600 mt-1">
                {stats?.pending_applications || 0}
              </p>
            </div>
          </div>

          {/* Quick Action Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Registrations Table */}
            <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="font-display font-black text-lg text-[#121217]">
                  Recent Student Registrations
                </h3>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="text-xs font-black text-[#E91E63] hover:underline"
                >
                  View All ({registrations.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {registrations.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#121217]">{r.student_name}</p>
                      <p className="text-stone-500 text-[11px]">{r.event_name} · {r.college}</p>
                    </div>
                    <span className="font-mono font-bold bg-[#FFD43B] text-black px-2 py-0.5 rounded text-[11px]">
                      {r.registration_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Stall Applications */}
            <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="font-display font-black text-lg text-[#121217]">
                  Pending Stall Applications
                </h3>
                <button
                  onClick={() => setActiveTab('stalls')}
                  className="text-xs font-black text-[#FF7A00] hover:underline"
                >
                  Manage Stalls →
                </button>
              </div>

              <div className="space-y-2.5">
                {stallApps.filter((a) => a.status === 'pending').slice(0, 5).map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#121217]">Stall {app.stall_id}</span>
                        <span className="text-[10px] font-black uppercase bg-orange-100 text-[#FF7A00] px-1.5 py-0.2 rounded">
                          {app.type}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5">{app.item_name} by {app.applicant_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReviewStall(app.id, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewStall(app.id, 'reject')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {stallApps.filter((a) => a.status === 'pending').length === 0 && (
                  <p className="text-stone-500 text-xs text-center py-6">No pending stall applications!</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EVENT MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl text-[#121217]">
              FESTIVAL EVENTS INVENTORY ({events.length})
            </h2>
            <button
              onClick={handleOpenCreateEvent}
              className="bg-[#121217] hover:bg-[#E91E63] text-white px-4 py-2 rounded-full font-black text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Event
            </button>
          </div>

          <div className="bg-white border-2 border-[#121217] rounded-3xl overflow-hidden fest-shadow">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b-2 border-[#121217] font-black uppercase text-stone-600">
                    <th className="py-3 px-4 min-w-[140px]">Event Name</th>
                    <th className="py-3 px-4 min-w-[90px]">Category</th>
                    <th className="py-3 px-4 min-w-[105px]">Team Size</th>
                    <th className="py-3 px-4 min-w-[130px]">Date &amp; Time</th>
                    <th className="py-3 px-4 min-w-[130px]">Venue</th>
                    <th className="py-3 px-4 min-w-[160px]">Prize Pool &amp; Podium</th>
                    <th className="py-3 px-4 text-center min-w-[95px]">Registrations</th>
                    <th className="py-3 px-4 text-right min-w-[85px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-semibold">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-sm text-[#121217]">
                        {evt.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                          evt.category === 'technical'
                            ? 'bg-[#8E44FF] text-white'
                            : evt.category === 'cultural'
                            ? 'bg-[#E91E63] text-white'
                            : 'bg-[#16A34A] text-white'
                        }`}>
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          Number(evt.max_team_size) === 1
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-purple-100 text-[#8E44FF] border border-purple-200'
                        }`}>
                          {Number(evt.max_team_size) === 1
                            ? '👤 Solo (1)'
                            : `👥 ${evt.min_team_size || 1}-${evt.max_team_size || 4} Members`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                        {evt.event_date} <br />
                        <span className="text-[11px] text-stone-400">{evt.start_time} - {evt.end_time}</span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{evt.venue}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#FF7A00] block">{evt.prize_pool}</span>
                        {(evt.prize_1st || evt.prize_2nd || evt.prize_3rd) && (
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-stone-600 font-semibold mt-0.5">
                            {evt.prize_1st && <span className="text-amber-800 font-black">🥇 {evt.prize_1st}</span>}
                            {evt.prize_2nd && <span className="text-slate-800 font-bold">🥈 {evt.prize_2nd}</span>}
                            {evt.prize_3rd && <span className="text-orange-900 font-semibold">🥉 {evt.prize_3rd}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold bg-stone-100 px-2.5 py-1 rounded-md">
                          {evt.registered_count || 0} / {evt.max_participants || 100}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          title="Edit Event"
                          className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-200 rounded-lg transition-colors inline-block"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.name)}
                          title="Delete Event"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STALL MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'stalls' && (
        <div className="space-y-6">
          
          {/* Header with Title and Sidebar Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-[#121217]">
                ADMIN STALL MANAGEMENT
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Interactive physical stall occupancy map, student applications registry, and lot status overrides
              </p>
            </div>

            <button
              onClick={() => setIsStallSidebarOpen(!isStallSidebarOpen)}
              className="bg-white hover:bg-stone-50 text-[#121217] px-4 py-2.5 rounded-2xl font-black text-xs border-2 border-[#121217] fest-shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
              title={isStallSidebarOpen ? 'Collapse side navigation' : 'Expand side navigation'}
            >
              {isStallSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-stone-600" />
                  <span>Hide Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#FF7A00]" />
                  <span>Show Sections Sidebar</span>
                </>
              )}
            </button>
          </div>

          {/* Main Layout: Side Navbar + Content View */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            
            {/* Side Navbar (Collapsible) */}
            <StallAdminSidebar
              activeSection={stallSection}
              setActiveSection={setStallSection}
              isOpen={isStallSidebarOpen}
              onToggle={() => setIsStallSidebarOpen(!isStallSidebarOpen)}
              stalls={stalls}
              stallApps={stallApps}
            />

            {/* Dynamic Stall Section Content */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              
              {/* 1. FOOD STREET BOULEVARD */}
              {stallSection === 'food' && (
                <FoodStreetBoulevard
                  stalls={stalls}
                  onToggleStatus={handleToggleStallStatus}
                />
              )}

              {/* 2. CENTRAL CARNIVAL GAME ARENA */}
              {stallSection === 'game' && (
                <CarnivalGameArena
                  stalls={stalls}
                  onToggleStatus={handleToggleStallStatus}
                />
              )}

              {/* 3. STALL APPLICATIONS REGISTRY */}
              {stallSection === 'applications' && (
                <StallApplicationsRegistry
                  stallApps={stallApps}
                  onReviewStall={handleReviewStall}
                />
              )}

              {/* 4. ALL FESTIVAL STALL LOTS */}
              {stallSection === 'all-lots' && (
                <FestivalStallLots
                  stalls={stalls}
                  onToggleStatus={handleToggleStallStatus}
                />
              )}

              {/* 5. VIEW ALL TOGETHER (OPTIONAL OVERVIEW) */}
              {stallSection === 'view-all' && (
                <div className="space-y-8">
                  <FoodStreetBoulevard
                    stalls={stalls}
                    onToggleStatus={handleToggleStallStatus}
                  />
                  <CarnivalGameArena
                    stalls={stalls}
                    onToggleStatus={handleToggleStallStatus}
                  />
                  <StallApplicationsRegistry
                    stallApps={stallApps}
                    onReviewStall={handleReviewStall}
                  />
                  <FestivalStallLots
                    stalls={stalls}
                    onToggleStatus={handleToggleStallStatus}
                  />
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: REGISTRATION MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-[#121217]">
                PARTICIPANT REGISTRATIONS ({registrations.length})
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Filter by event, verify QR codes, and export complete roster
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="bg-[#121217] hover:bg-[#8E44FF] text-white px-4 py-2 rounded-full font-black text-xs border border-[#121217] fest-shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                EXPORT TO CSV
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-[#121217] fest-shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={regEventFilter}
                onChange={(e) => setRegEventFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-700"
              >
                <option value="all">🎪 All Events</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search participant name, email, college, or registration ID..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
              <span className="text-[11px] font-black uppercase text-stone-500 mr-1">Status:</span>
              {['all', 'confirmed', 'attended', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRegStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-black capitalize transition-all ${
                    regStatusFilter === st
                      ? 'bg-[#121217] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-[#121217] rounded-3xl overflow-hidden fest-shadow">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b-2 border-[#121217] font-black uppercase text-stone-600">
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions &amp; Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-semibold">
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-stone-50">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className="bg-[#FFD43B] text-black px-2 py-0.5 rounded">
                          {reg.registration_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#121217]">{reg.student_name}</p>
                        <p className="text-stone-400 text-[11px]">{reg.student_email} · {reg.student_phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-800">{reg.event_name}</td>
                      <td className="py-3.5 px-4 text-stone-600">{reg.college}</td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                          reg.status === 'attended'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : reg.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {reg.status !== 'attended' && reg.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateRegStatus(reg.id, 'attended')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-black text-xs inline-block"
                            title="Check-In Participant / Mark Attended"
                          >
                            ✓ Check-In
                          </button>
                        )}
                        {reg.status === 'attended' && (
                          <button
                            onClick={() => handleUpdateRegStatus(reg.id, 'confirmed')}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 px-2 py-1 rounded-lg font-bold text-xs inline-block"
                            title="Reset to confirmed"
                          >
                            Attended ✓
                          </button>
                        )}
                        <a
                          href={`/registration/verify/${reg.qr_token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-stone-100 hover:bg-stone-200 text-[#8E44FF] border border-stone-300 px-2 py-1 rounded-lg font-bold text-xs inline-block"
                        >
                          QR Pass
                        </a>
                        {reg.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel registration for ${reg.student_name}?`)) {
                                handleUpdateRegStatus(reg.id, 'cancelled');
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs px-1"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SPORTS LIVE LEADERBOARD MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-[#121217]">
                SPORTS LEADERBOARD MANAGEMENT
              </h2>
              <p className="text-xs font-semibold text-stone-500">
                Update scores, ranks, match states in real time. Changes are broadcast to all connected viewers immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['LIVE', 'UPCOMING', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateMatchStatus(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase border-2 border-[#121217] transition-all cursor-pointer ${
                    selectedLeaderboard?.status === st
                      ? st === 'LIVE' ? 'bg-rose-500 text-white' : 'bg-[#121217] text-white'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Set {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sport Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {leaderboards.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedLeaderboard(b)}
                className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                  selectedLeaderboard?.id === b.id
                    ? 'bg-[#121217] text-white border-[#121217] fest-shadow-sm'
                    : 'bg-white text-stone-800 border-stone-300'
                }`}
              >
                {b.sport_name} ({b.status})
              </button>
            ))}
          </div>


          {/* Current Entries Table with Dynamic Points Adjustment */}
          <div className="bg-white border-2 border-[#121217] rounded-3xl overflow-hidden fest-shadow">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-display font-black text-sm text-[#121217] uppercase tracking-wide">
                  Live Teams &amp; Standings — {selectedLeaderboard?.sport_name}
                </h4>
                <p className="text-[11px] text-stone-500 font-semibold">
                  Click quick buttons (+1, +2, +3, -1) or edit points manually to dynamically update and broadcast ranks in real-time.
                </p>
              </div>
              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {selectedLeaderboard?.entries?.length || 0} Competing Teams
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b-2 border-[#121217] font-black uppercase text-stone-600">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Squad / Captain</th>
                    <th className="py-3 px-4">Current Score</th>
                    <th className="py-3 px-4">Tournament Points</th>
                    <th className="py-3 px-4 text-center">Quick Adjust Points</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-semibold">
                  {(!selectedLeaderboard?.entries || selectedLeaderboard.entries.length === 0) && (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-stone-500">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl mb-2">🏅</span>
                          <p className="font-bold text-sm text-stone-700">No teams registered yet</p>
                          <p className="text-xs text-stone-400 mt-1 max-w-sm">
                            When participants or teams register for {selectedLeaderboard?.sport_name || 'this sport'}, they will automatically appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {selectedLeaderboard?.entries?.map((e) => {
                    const isEditing = editingScoreEntry?.id === e.id;
                    return (
                      <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-base">
                          {e.rank === 1 ? '🥇 #1' : e.rank === 2 ? '🥈 #2' : e.rank === 3 ? '🥉 #3' : `#${e.rank}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-sm text-[#121217]">{e.team_name}</p>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">{e.participant_name || '—'}</td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingScoreEntry.score}
                              onChange={(ev) => setEditingScoreEntry({ ...editingScoreEntry, score: ev.target.value })}
                              placeholder="e.g. 145/4 or 3 Goals"
                              className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono w-32"
                            />
                          ) : (
                            <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              {e.score || '0'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingScoreEntry.points}
                              onChange={(ev) => setEditingScoreEntry({ ...editingScoreEntry, points: ev.target.value })}
                              className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-black w-20 text-[#16A34A]"
                            />
                          ) : (
                            <span className="font-black text-[#16A34A] text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              {e.points || 0} pts
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPoints(selectedLeaderboard.id, e.id, -1)}
                              title="Deduct 1 point"
                              className="px-2 py-1 bg-stone-100 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded-lg font-black text-xs border border-stone-300 transition-colors"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPoints(selectedLeaderboard.id, e.id, 1)}
                              title="Add 1 point"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-lg font-black text-xs border border-emerald-300 transition-colors"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPoints(selectedLeaderboard.id, e.id, 2)}
                              title="Add 2 points (Win / Major Goal)"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-lg font-black text-xs border border-emerald-300 transition-colors"
                            >
                              +2
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPoints(selectedLeaderboard.id, e.id, 3)}
                              title="Add 3 points"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs border border-emerald-700 transition-colors shadow-xs"
                            >
                              +3
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveDirectPoints(selectedLeaderboard.id, e.id, editingScoreEntry.points, editingScoreEntry.score)}
                                className="bg-[#16A34A] hover:bg-[#13803a] text-white px-2.5 py-1 rounded-lg font-black text-xs"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingScoreEntry(null)}
                                className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-2 py-1 rounded-lg font-bold text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingScoreEntry({ id: e.id, points: e.points || 0, score: e.score || '' })}
                                className="text-stone-600 hover:text-black font-bold text-xs underline"
                              >
                                Edit Pts
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(e.id)}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CERTIFICATE GENERATION */}
      {/* ======================================================== */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-black text-2xl text-[#121217]">
              FESTIVAL CERTIFICATE SYSTEM
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              One-click cryptographic certificate generation and automatic email dispatch to registered students
            </p>
          </div>

          <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-5">
            <h3 className="font-display font-black text-xl text-[#121217]">
              Generate &amp; Send Event Certificates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                  Select Event *
                </label>
                <select
                  value={certTargetEvent}
                  onChange={(e) => setCertTargetEvent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-[#121217] rounded-xl text-xs font-bold"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                  Achievement / Citation Text
                </label>
                <input
                  type="text"
                  value={certAchievement}
                  onChange={(e) => setCertAchievement(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-[#121217] rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateAllCerts}
                disabled={certGenerating}
                className="bg-[#8E44FF] hover:bg-[#7b35e2] text-white px-8 py-3.5 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                {certGenerating ? 'Generating & Dispatching...' : 'GENERATE & SEND ALL CERTIFICATES'}
              </button>
            </div>
          </div>

          {/* Generated Certificates Log */}
          <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-xl text-[#121217]">
                  Issued Certificates Registry ({certificates.length})
                </h3>
                <p className="text-xs text-stone-500 font-semibold">
                  Preview any student certificate with official college stamps and verify cryptographic QR tokens
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search certificate ID, student, or event..."
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {filteredCerts.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No certificates found. Generate certificates above to populate this registry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 border-b-2 border-[#121217] font-black uppercase text-stone-600">
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Student &amp; Email</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Achievement Citation</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-semibold">
                    {filteredCerts.map((cert) => (
                      <tr key={cert.id} className="hover:bg-stone-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#8E44FF]">
                          {cert.certificate_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#121217]">{cert.participant_name}</p>
                          <p className="text-stone-400 text-[11px]">{cert.participant_email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-800">{cert.event_name}</td>
                        <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">{cert.achievement}</td>
                        <td className="py-3.5 px-4 text-stone-500">{cert.issued_date}</td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="bg-[#121217] hover:bg-[#8E44FF] text-white px-2.5 py-1 rounded-lg font-black text-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <a
                            href={`/certificate/verify/${cert.certificate_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-stone-100 hover:bg-stone-200 text-[#8E44FF] border border-stone-300 px-2.5 py-1 rounded-lg font-bold text-xs inline-block"
                          >
                            Verify Link
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: EMAIL BROADCAST SYSTEM */}
      {/* ======================================================== */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-black text-2xl text-[#121217]">
              EMAIL BROADCAST &amp; ANNOUNCEMENTS
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              Send notifications, schedule updates, or venue alerts directly to participants
            </p>
          </div>

          {/* Email Composer Form */}
          <form onSubmit={handleSendBroadcast} className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                  Target Event Recipients *
                </label>
                <select
                  value={emailTargetEvent}
                  onChange={(e) => setEmailTargetEvent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-bold"
                >
                  <option value="all">📢 All Registered Festival Participants ({registrations.length})</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({registrations.filter((r) => r.event_id === e.id).length} registered)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-600">
                <span className="text-stone-400 block uppercase text-[10px]">Estimated Delivery Count:</span>
                <span className="text-base text-[#121217] font-black">{targetEventRecipientsCount} Registered Student(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                Email Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 📢 Important Update: Code Clash Venue & Setup Instructions"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                Announcement Message (Rich Text) *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Write your announcement message here. Formatted festival signature will be appended automatically..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={emailSending}
                className="bg-[#121217] hover:bg-[#FF7A00] text-white px-8 py-3 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {emailSending ? 'Dispatched Emails...' : `SEND EMAIL TO ${targetEventRecipientsCount} PARTICIPANTS`}
              </button>
            </div>
          </form>

          {/* Delivery Logs */}
          <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow space-y-4">
            <h3 className="font-display font-black text-xl text-[#121217]">
              Dispatched Email Logs ({emailLogs.length})
            </h3>

            <div className="divide-y divide-stone-200">
              {emailLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#121217]">{log.subject}</span>
                    <p className="text-stone-400 text-[11px]">To: {log.to} · {new Date(log.sent_at).toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Delivered
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: DISCUSSION MODERATION */}
      {/* ======================================================== */}
      {activeTab === 'discussion' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-black text-2xl text-[#121217]">
              DISCUSSION MODERATION ({discussions.length})
            </h2>
            <p className="text-xs font-semibold text-stone-500">
              Moderate student chat, filter abusive comments, and maintain community safety
            </p>
          </div>

          <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow divide-y divide-stone-200">
            {discussions.map((msg) => (
              <div key={msg.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#121217]">{msg.user_name}</span>
                    <span className="text-stone-400">({msg.user_dept || 'Student'})</span>
                    <span className="text-stone-400">· {new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-stone-700">{msg.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteDiscussion(msg.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT EVENT MODAL */}
      {/* ======================================================== */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border-3 border-[#121217] fest-shadow-xl p-6 sm:p-8 my-8">
            <h2 className="font-display font-black text-2xl text-[#121217] mb-4">
              {editingEvent ? 'Edit Festival Event' : 'Create New Festival Event'}
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.name}
                    onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Category *</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  >
                    <option value="technical">Technical</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                  </select>
                  {eventFormData.category === 'sports' && (
                    <span className="text-[10px] text-[#16A34A] font-bold block mt-1">
                      🏆 Selecting Sports automatically creates its live leaderboard in the Sports tab.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Total Prize Pool</label>
                  <input
                    type="text"
                    value={eventFormData.prize_pool}
                    onChange={(e) => setEventFormData({ ...eventFormData, prize_pool: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                    placeholder="e.g. ₹25,000"
                  />
                </div>
              </div>

              {/* 1st, 2nd, 3rd Prize Breakdown Inputs */}
              <div className="p-3.5 bg-amber-50/60 border-2 border-amber-300 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-amber-900 block">
                  Podium Prize Money Breakdown (1st, 2nd, 3rd)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-amber-950 mb-1">
                      🥇 1st Prize Money
                    </label>
                    <input
                      type="text"
                      value={eventFormData.prize_1st}
                      onChange={(e) => setEventFormData({ ...eventFormData, prize_1st: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-400 rounded-xl text-xs font-black text-amber-950"
                      placeholder="e.g. ₹12,000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-800 mb-1">
                      🥈 2nd Prize Money
                    </label>
                    <input
                      type="text"
                      value={eventFormData.prize_2nd}
                      onChange={(e) => setEventFormData({ ...eventFormData, prize_2nd: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-xl text-xs font-black text-slate-900"
                      placeholder="e.g. ₹8,000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-orange-950 mb-1">
                      🥉 3rd Prize Money
                    </label>
                    <input
                      type="text"
                      value={eventFormData.prize_3rd}
                      onChange={(e) => setEventFormData({ ...eventFormData, prize_3rd: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-orange-400 rounded-xl text-xs font-black text-orange-950"
                      placeholder="e.g. ₹5,000"
                    />
                  </div>
                </div>
              </div>

              {/* Team Size Limit Specification */}
              <div className="p-3.5 bg-purple-50/70 border-2 border-purple-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-purple-950 block">
                    👥 Team Size Specification (Allowed Squad Limits)
                  </span>
                  <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                    {Number(eventFormData.max_team_size) === 1
                      ? '👤 Solo / Individual (1 Member)'
                      : `👥 Team: ${eventFormData.min_team_size} to ${eventFormData.max_team_size} Members`}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-900 mb-1">
                      Minimum Team Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={eventFormData.min_team_size}
                      onChange={(e) => setEventFormData({ ...eventFormData, min_team_size: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-black text-purple-950"
                    />
                    <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                      Set to 1 for individual events or minimum squad members.
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-900 mb-1">
                      Maximum Team Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={eventFormData.max_team_size}
                      onChange={(e) => setEventFormData({ ...eventFormData, max_team_size: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-black text-purple-950"
                    />
                    <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                      Set to 1 for solo events. For team events (e.g. 4 for Hackathon, 11 for Cricket).
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={eventFormData.start_time}
                    onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={eventFormData.end_time}
                    onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={eventFormData.max_participants}
                    onChange={(e) => setEventFormData({ ...eventFormData, max_participants: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Rounds Section */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-stone-800">
                    Competition Rounds UI
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRound}
                    className="text-xs font-black text-[#8E44FF] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + ADD ROUND
                  </button>
                </div>

                <div className="space-y-3">
                  {eventFormData.rounds.map((rnd, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Round Name (e.g. Round 1: Coding Challenge)"
                          value={rnd.round_name}
                          onChange={(e) => {
                            const updated = [...eventFormData.rounds];
                            updated[idx].round_name = e.target.value;
                            setEventFormData({ ...eventFormData, rounds: updated });
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Time (e.g. 10:00 AM)"
                          value={rnd.time}
                          onChange={(e) => {
                            const updated = [...eventFormData.rounds];
                            updated[idx].time = e.target.value;
                            setEventFormData({ ...eventFormData, rounds: updated });
                          }}
                          className="w-32 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                        />
                        {eventFormData.rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(idx)}
                            className="p-1.5 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Round description & rules..."
                        value={rnd.description}
                        onChange={(e) => {
                          const updated = [...eventFormData.rounds];
                          updated[idx].description = e.target.value;
                          setEventFormData({ ...eventFormData, rounds: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinator Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-700 mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    value={eventFormData.contact_name}
                    onChange={(e) => setEventFormData({ ...eventFormData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-700 mb-1">Coordinator Email</label>
                  <input
                    type="email"
                    value={eventFormData.contact_email}
                    onChange={(e) => setEventFormData({ ...eventFormData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-700 mb-1">Coordinator Phone</label>
                  <input
                    type="tel"
                    value={eventFormData.contact_phone}
                    onChange={(e) => setEventFormData({ ...eventFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-5 py-2.5 rounded-full border-2 border-stone-300 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#121217] hover:bg-[#E91E63] text-white px-6 py-2.5 rounded-full font-black text-xs border-2 border-[#121217] fest-shadow-sm transition-all"
                >
                  Save Event
                </button>
              </div>

            </form>
          </div>
        </div>
      )}



      {/* Certificate Preview Modal */}
      {previewCert && (
        <CertificateModal
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}

    </div>
  );
}
