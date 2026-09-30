import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, ShieldCheck, Users, Sparkles } from 'lucide-react';
import RealTimeQRScanner from '../components/scanner/RealTimeQRScanner';
import { eventsAPI, volunteerAPI } from '../services/api';

export default function RealTimeScannerPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventsAPI.getEvents();
        setEvents(res.data?.events || []);
      } catch (e) {
        console.warn('Failed to load events:', e);
      }
    };

    const loadAttendees = async () => {
      try {
        const res = await volunteerAPI.getAttendees({});
        const list = res.data?.attendees || [];
        setAttendeeCount(list.filter((a) => a.status === 'attended').length);
      } catch (e) {
        console.warn('Failed to load attendee count:', e);
      }
    };

    loadEvents();
    loadAttendees();
  }, []);

  const handleAttendanceMarked = () => {
    setAttendeeCount((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-[#121217] pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/volunteer"
            className="p-3 bg-white border-2 border-[#121217] rounded-2xl hover:bg-[#FFD43B] transition-colors fest-shadow-sm"
            title="Back to Volunteer Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#121217]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E91E63] text-white text-[10px] font-black uppercase tracking-wider">
                Live Gate Ops
              </span>
              <span className="flex items-center gap-1 text-xs font-black text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Scanner Online</span>
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#121217] mt-1">
              Live Participant Gate Scanner
            </h1>
            <p className="text-xs font-bold text-stone-500 mt-0.5">
              Point your camera at attendee passes to fetch full participant details in real time.
            </p>
          </div>
        </div>

        {/* Quick Stats & Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#121217] rounded-2xl px-4 py-2.5 fest-shadow-sm text-center">
            <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500">
              Total Checked-In
            </span>
            <strong className="font-display font-black text-xl text-[#7ED957]">
              {attendeeCount}
            </strong>
          </div>

          <Link
            to="/volunteer"
            className="px-4 py-2.5 bg-[#121217] hover:bg-[#8E44FF] text-white rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-[#121217] fest-shadow-sm transition-all"
          >
            Volunteer Portal
          </Link>
        </div>
      </div>

      {/* Real-Time Scanner Core Component */}
      <RealTimeQRScanner
        onAttendanceMarked={handleAttendanceMarked}
        autoCheckInDefault={false}
        showHistory={true}
      />
    </div>
  );
}
