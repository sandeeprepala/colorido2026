import React, { useState } from 'react';
import { Utensils, Gamepad2, CheckCircle2, Clock, Ban, Info, Sparkles, MapPin } from 'lucide-react';

export default function StallMap({ stalls = [], selectedStall, onSelectStall, onApplyClick, isAdmin = false, defaultFilter = 'all' }) {
  const [filterType, setFilterType] = useState(defaultFilter);

  React.useEffect(() => {
    if (defaultFilter) {
      setFilterType(defaultFilter);
    }
  }, [defaultFilter]);

  const foodStalls = stalls.filter((s) => s.type === 'food');
  const gameStalls = stalls.filter((s) => s.type === 'game');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-500 text-emerald-950',
          dot: 'bg-emerald-500',
          label: 'Available',
          badgeBg: 'bg-emerald-500 text-white',
        };
      case 'pending':
        return {
          bg: 'bg-amber-100 hover:bg-amber-200 border-amber-500 text-amber-950',
          dot: 'bg-amber-500',
          label: 'Pending Approval',
          badgeBg: 'bg-amber-500 text-black',
        };
      case 'occupied':
        return {
          bg: 'bg-rose-100 hover:bg-rose-200 border-rose-500 text-rose-950',
          dot: 'bg-rose-500',
          label: 'Occupied',
          badgeBg: 'bg-rose-500 text-white',
        };
      default:
        return {
          bg: 'bg-stone-100 border-stone-300 text-stone-500',
          dot: 'bg-stone-400',
          label: 'Unavailable',
          badgeBg: 'bg-stone-400 text-white',
        };
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Legend & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#121217] fest-shadow-sm">
        
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-bold">
          <span className="text-stone-500 uppercase tracking-wider text-[11px]">Map Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-stone-400"></span>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'all' ? 'bg-[#121217] text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => setFilterType('food')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filterType === 'food' ? 'bg-[#FF7A00] text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            <Utensils className="w-3 h-3" /> Food Street
          </button>
          <button
            onClick={() => setFilterType('game')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filterType === 'game' ? 'bg-[#8E44FF] text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            <Gamepad2 className="w-3 h-3" /> Carnival Games
          </button>
        </div>
      </div>

      {/* Graphical Floorplan / Campus Stall Arena */}
      <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-3xl p-5 sm:p-8 fest-shadow relative overflow-hidden">
        
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none"></div>

        {/* ZONE 1: FOOD STREET */}
        {(filterType === 'all' || filterType === 'food') && (
          <div className="mb-10 relative">
            <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-[#FF7A00]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FF7A00] text-white fest-shadow-sm">
                  <Utensils className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-black text-xl text-[#121217] tracking-tight">
                    FOOD STREET BOULEVARD
                  </h3>
                  <p className="text-xs font-semibold text-stone-500">
                    Artisan bites, live grills, desserts, and beverage stations
                  </p>
                </div>
              </div>
              <span className="text-xs font-black bg-orange-100 text-[#FF7A00] px-3 py-1 rounded-full border border-orange-300">
                10 Lots (F01 - F10)
              </span>
            </div>

            {/* Food Stalls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {foodStalls.map((stall) => {
                const isSelected = selectedStall?.stall_id === stall.stall_id;
                const statusTheme = getStatusBadge(stall.status);

                return (
                  <button
                    key={stall.stall_id}
                    onClick={() => onSelectStall(stall)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      statusTheme.bg
                    } ${
                      isSelected
                        ? 'ring-4 ring-[#121217] -translate-y-1.5 shadow-lg border-[#121217]'
                        : 'border-[#121217]/60 hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    {/* Stall Lot ID & Status Dot */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-black text-base sm:text-lg text-[#121217]">
                        {stall.stall_id}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${statusTheme.dot} ring-2 ring-white`}></span>
                    </div>

                    {/* Stall Title / Item */}
                    <div className="min-h-[38px]">
                      <p className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                        {stall.item_name || stall.name || 'Available Lot'}
                      </p>
                      <p className="text-[11px] font-semibold text-stone-600 line-clamp-1">
                        {stall.status === 'occupied'
                          ? `By ${stall.applicant_name || 'Chef'}`
                          : stall.status === 'pending'
                          ? 'Review Pending'
                          : 'Ready to Book'}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-black uppercase">
                      <span className="text-stone-700">{stall.type}</span>
                      <span className={`px-2 py-0.5 rounded-md ${statusTheme.badgeBg}`}>
                        {stall.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Central Walking Lawn Pathway */}
        {filterType === 'all' && (
          <div className="my-8 py-3 bg-[#FAF8F5] border-y-2 border-dashed border-stone-300 rounded-xl text-center text-xs font-black tracking-widest text-stone-400 uppercase flex items-center justify-center gap-3">
            <span>─────</span>
            <span>🎪 FESTIVAL CENTRAL PROMENADE &amp; LAWN 🎪</span>
            <span>─────</span>
          </div>
        )}

        {/* ZONE 2: CARNIVAL GAME ZONE */}
        {(filterType === 'all' || filterType === 'game') && (
          <div className="relative">
            <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-[#8E44FF]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#8E44FF] text-white fest-shadow-sm">
                  <Gamepad2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-black text-xl text-[#121217] tracking-tight">
                    CENTRAL CARNIVAL GAME ARENA
                  </h3>
                  <p className="text-xs font-semibold text-stone-500">
                    Arcades, VR simulations, ring toss, archery, and competitive challenges
                  </p>
                </div>
              </div>
              <span className="text-xs font-black bg-purple-100 text-[#8E44FF] px-3 py-1 rounded-full border border-purple-300">
                10 Lots (G01 - G10)
              </span>
            </div>

            {/* Game Stalls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {gameStalls.map((stall) => {
                const isSelected = selectedStall?.stall_id === stall.stall_id;
                const statusTheme = getStatusBadge(stall.status);

                return (
                  <button
                    key={stall.stall_id}
                    onClick={() => onSelectStall(stall)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      statusTheme.bg
                    } ${
                      isSelected
                        ? 'ring-4 ring-[#121217] -translate-y-1.5 shadow-lg border-[#121217]'
                        : 'border-[#121217]/60 hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    {/* Stall Lot ID & Status Dot */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-black text-base sm:text-lg text-[#121217]">
                        {stall.stall_id}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${statusTheme.dot} ring-2 ring-white`}></span>
                    </div>

                    {/* Stall Title / Item */}
                    <div className="min-h-[38px]">
                      <p className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                        {stall.item_name || stall.name || 'Available Lot'}
                      </p>
                      <p className="text-[11px] font-semibold text-stone-600 line-clamp-1">
                        {stall.status === 'occupied'
                          ? `By ${stall.applicant_name || 'Host'}`
                          : stall.status === 'pending'
                          ? 'Review Pending'
                          : 'Ready to Book'}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-black uppercase">
                      <span className="text-stone-700">{stall.type}</span>
                      <span className={`px-2 py-0.5 rounded-md ${statusTheme.badgeBg}`}>
                        {stall.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Selected Stall Inspector Box */}
      {selectedStall && (
        <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-7 fest-shadow animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#121217]">
                  STALL {selectedStall.stall_id}
                </span>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                  getStatusBadge(selectedStall.status).badgeBg
                }`}>
                  {selectedStall.status}
                </span>
                <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-300 uppercase">
                  {selectedStall.type === 'food' ? '🍔 Food & Beverage' : '🎯 Carnival Games'}
                </span>
              </div>

              {selectedStall.status === 'occupied' ? (
                <div className="space-y-1">
                  <p className="text-base font-bold text-stone-900">
                    {selectedStall.item_name || selectedStall.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    {selectedStall.description}
                  </p>
                  {selectedStall.price && (
                    <p className="text-xs font-bold text-[#FF7A00]">
                      Price Structure: {selectedStall.price}
                    </p>
                  )}
                </div>
              ) : selectedStall.status === 'pending' ? (
                <p className="text-sm font-medium text-amber-700">
                  An application for this stall lot is currently undergoing committee review.
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  This prime festival lot is currently vacant! Click below to submit your student stall application.
                </p>
              )}
            </div>

            {/* Application CTA */}
            <div className="shrink-0 flex items-center gap-3">
              {selectedStall.status === 'available' ? (
                <button
                  onClick={() => onApplyClick(selectedStall)}
                  className="bg-[#121217] hover:bg-[#E91E63] text-white px-6 py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  SELECT THIS STALL
                </button>
              ) : (
                <div className="text-xs font-bold text-stone-500 bg-stone-100 px-4 py-2.5 rounded-full border border-stone-300">
                  {selectedStall.status === 'occupied' ? 'Stall Occupied' : 'Pending Approval'}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
