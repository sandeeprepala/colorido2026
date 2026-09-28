import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import EventCard from '../components/common/EventCard';
import { eventsAPI } from '../services/api';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search.trim()) params.search = search.trim();
      if (selectedDate !== 'all') params.date = selectedDate;
      if (selectedVenue !== 'all') params.venue = selectedVenue;

      const res = await eventsAPI.getEvents(params);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('EventsPage fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== category) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [category, selectedDate, selectedVenue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: newCat });
    }
  };

  const handleResetFilters = () => {
    setCategory('all');
    setSearch('');
    setSelectedDate('all');
    setSelectedVenue('all');
    setSearchParams({});
  };

  // Distinct venues for filter dropdown
  const uniqueVenues = Array.from(
    new Set(events.map((e) => e.venue?.split(',')[0].trim()).filter(Boolean))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#E91E63] bg-pink-100 px-3 py-1 rounded-full inline-block border border-pink-200">
          ALL COMPETITIONS &amp; EXPERIENCES
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          FESTIVAL EVENTS
        </h1>
        <p className="font-semibold text-stone-600 text-sm sm:text-base">
          Browse, filter, and register for 16 premier Technical hackathons, Cultural showcases, and Varsity sports tournaments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#121217] rounded-3xl p-5 sm:p-6 fest-shadow space-y-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
          {[
            { id: 'all', label: 'All Arenas', color: 'bg-[#121217] text-white' },
            { id: 'technical', label: '⚡ Technical', color: 'bg-[#8E44FF] text-white' },
            { id: 'cultural', label: '🎭 Cultural', color: 'bg-[#E91E63] text-white' },
            { id: 'sports', label: '🏆 Sports', color: 'bg-[#16A34A] text-white' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                category === tab.id
                  ? `${tab.color} fest-shadow-sm`
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by event name, description, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#121217] focus:bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </form>

          {/* Date Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 focus:outline-hidden focus:border-[#121217]"
            >
              <option value="all">📅 All Dates</option>
              <option value="2026-10-18">Day 1: Oct 18, 2026</option>
              <option value="2026-10-19">Day 2: Oct 19, 2026</option>
              <option value="2026-10-20">Day 3: Oct 20, 2026</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              onClick={fetchEvents}
              className="flex-1 bg-[#121217] hover:bg-[#E91E63] text-white py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs font-bold text-stone-500">
        <span>Showing {events.length} event{events.length === 1 ? '' : 's'}</span>
        <span className="capitalize">{category} Category</span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-[#121217] border-t-[#E91E63] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-stone-500 text-sm">Loading festival events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#121217] rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <p className="font-display font-black text-2xl text-stone-800">No Events Found</p>
          <p className="text-xs font-semibold text-stone-500">
            No events match your current filter criteria. Try adjusting your search term or category.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-[#121217] text-white text-xs font-black px-6 py-2.5 rounded-full"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}

    </div>
  );
}
