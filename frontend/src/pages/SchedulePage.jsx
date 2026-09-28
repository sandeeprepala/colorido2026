import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Sparkles, Filter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventsAPI } from '../services/api';

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('2026-10-18');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventsAPI.getEvents();
        setEvents(res.data.events || []);
      } catch (err) {
        console.error('Schedule fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const days = [
    { date: '2026-10-18', label: 'DAY 1', title: 'Grand Inauguration & Kickoff', sub: 'Saturday, Oct 18' },
    { date: '2026-10-19', label: 'DAY 2', title: 'Main Clashes & Rock Night', sub: 'Sunday, Oct 19' },
    { date: '2026-10-20', label: 'DAY 3', title: 'Grand Finals & Fashion Gala', sub: 'Monday, Oct 20' },
  ];

  // Filter events by day and category
  const filteredDayEvents = events
    .filter((e) => e.event_date === activeDay)
    .filter((e) => categoryFilter === 'all' || e.category.toLowerCase() === categoryFilter.toLowerCase())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#8E44FF] bg-purple-100 px-3 py-1 rounded-full inline-block border border-purple-200">
          EVENT TIMELINE &amp; AGENDA
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          FESTIVAL SCHEDULE
        </h1>
        <p className="font-semibold text-stone-600 text-sm sm:text-base">
          Track time slots, match fixtures, and stage performances across all 3 days of COLORIDO '26.
        </p>
      </div>

      {/* Day Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {days.map((day) => {
          const isSelected = activeDay === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setActiveDay(day.date)}
              className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-[#121217] text-white border-[#121217] fest-shadow-lg -translate-y-1'
                  : 'bg-white text-[#121217] border-[#121217] fest-shadow hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-[#FFD43B] text-black' : 'bg-stone-100 text-stone-700'
                }`}>
                  {day.label}
                </span>
                <span className="text-xs font-semibold text-stone-400">
                  {day.sub}
                </span>
              </div>
              <h3 className="font-display font-black text-lg mt-2 tracking-tight">
                {day.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border-2 border-[#121217] fest-shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-black uppercase tracking-wider text-stone-600">Filter Category:</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold relative">
          {['all', 'technical', 'cultural', 'sports'].map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="relative isolate px-3.5 py-1.5 rounded-xl capitalize transition-colors cursor-pointer select-none"
              >
                {isSelected && (
                  <motion.span
                    layoutId="schedule-category-capsule"
                    className="absolute inset-0 bg-[#121217] rounded-xl z-0 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${isSelected ? 'text-white font-black' : 'text-stone-700 hover:text-black'}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline View */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-stone-800 border-t-[#E91E63] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-stone-500">Loading schedule...</p>
        </div>
      ) : filteredDayEvents.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-10 text-center max-w-md mx-auto">
          <p className="font-display font-black text-xl text-stone-800">No events scheduled</p>
          <p className="text-xs text-stone-500 mt-1">Try switching categories or choosing another festival day.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-4 border-[#121217] space-y-8 my-6">
          {filteredDayEvents.map((evt, idx) => {
            const catColor = evt.category === 'technical'
              ? 'bg-[#8E44FF] text-white'
              : evt.category === 'cultural'
              ? 'bg-[#E91E63] text-white'
              : 'bg-[#16A34A] text-white';

            return (
              <div key={evt.id} className="relative group">
                
                {/* Timeline Node Dot */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-6 w-5 h-5 rounded-full bg-white border-4 border-[#121217] group-hover:scale-125 transition-transform"></div>

                {/* Event Card */}
                <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow hover:-translate-y-1 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                    
                    {/* Time Pill */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm bg-stone-100 text-[#121217] px-3 py-1 rounded-xl border border-stone-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#8E44FF]" />
                        {evt.start_time} - {evt.end_time}
                      </span>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${catColor}`}>
                        {evt.category}
                      </span>
                    </div>

                    {/* Venue Pin */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
                      <MapPin className="w-3.5 h-3.5 text-[#E91E63]" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-black text-2xl text-[#121217] group-hover:text-[#E91E63] transition-colors mb-2">
                    {evt.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-[#FF7A00]" />
                      Prize Pool: {evt.prize_pool}
                    </span>

                    <Link
                      to={`/events/${evt.id}`}
                      className="bg-[#121217] hover:bg-[#E91E63] text-white text-xs font-black px-4 py-2 rounded-full transition-all flex items-center gap-1"
                    >
                      View Details &amp; Rounds <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
