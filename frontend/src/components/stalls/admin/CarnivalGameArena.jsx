import React, { useState } from 'react';
import { Gamepad2, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export default function CarnivalGameArena({ stalls = [], onToggleStatus }) {
  const [selectedStall, setSelectedStall] = useState(null);

  const gameStalls = stalls.filter((s) => s.type === 'game');

  const availableCount = gameStalls.filter((s) => s.status === 'available').length;
  const occupiedCount = gameStalls.filter((s) => s.status === 'occupied').length;
  const pendingCount = gameStalls.filter((s) => s.status === 'pending').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-950',
          dot: 'bg-emerald-500',
          label: 'Available',
          badgeBg: 'bg-emerald-500 text-white',
        };
      case 'pending':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-950',
          dot: 'bg-amber-500',
          label: 'Pending Approval',
          badgeBg: 'bg-amber-500 text-black',
        };
      case 'occupied':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100 border-rose-400 text-rose-950',
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

  const activeStall = selectedStall
    ? gameStalls.find((s) => s.stall_id === selectedStall.stall_id) || selectedStall
    : null;

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-3xl p-5 sm:p-7 fest-shadow space-y-6 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-dashed border-[#8E44FF]/40 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-[#8E44FF] text-white fest-shadow-sm shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#121217] tracking-tight">
                CENTRAL CARNIVAL GAME ARENA
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-500">
              Arcades, VR simulations, ring toss, archery, and competitive challenges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-black bg-purple-100 text-[#8E44FF] px-3.5 py-1.5 rounded-full border border-purple-300">
            {gameStalls.length} Lots (G01 - G10)
          </span>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 text-xs font-bold">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-stone-400 uppercase tracking-wider text-[11px]">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span className="text-stone-700">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span className="text-stone-700">Occupied ({occupiedCount})</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
              <span className="text-stone-700">Pending ({pendingCount})</span>
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold text-stone-400">
          💡 Click lot to inspect / override
        </span>
      </div>

      {/* Game Stalls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
        {gameStalls.map((stall) => {
          const isSelected = activeStall?.stall_id === stall.stall_id;
          const statusTheme = getStatusBadge(stall.status);

          return (
            <button
              key={stall.stall_id}
              onClick={() => setSelectedStall(isSelected ? null : stall)}
              className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
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
                  {stall.status === 'occupied'
                    ? (stall.item_name || stall.name || 'Occupied Lot')
                    : stall.status === 'pending'
                    ? 'Under Review'
                    : 'Available Lot'}
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

      {/* Selected Stall Inspector Box */}
      {activeStall && (
        <div className="bg-white border-2 border-[#121217] rounded-3xl p-5 sm:p-6 fest-shadow animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-2xl sm:text-3xl text-[#121217]">
                  LOT {activeStall.stall_id}
                </span>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                  getStatusBadge(activeStall.status).badgeBg
                }`}>
                  {activeStall.status}
                </span>
                <span className="text-xs font-bold bg-purple-100 text-[#8E44FF] px-3 py-1 rounded-full border border-purple-200 uppercase">
                  🎯 Carnival Games
                </span>
              </div>

              {activeStall.status === 'occupied' ? (
                <div className="space-y-1 text-xs">
                  <p className="text-sm font-bold text-stone-900">
                    {activeStall.item_name || activeStall.name}
                  </p>
                  {activeStall.applicant_name && (
                    <p className="font-semibold text-stone-600">
                      Operator: <span className="font-bold text-[#121217]">{activeStall.applicant_name}</span>
                    </p>
                  )}
                  {activeStall.description && (
                    <p className="text-stone-500">{activeStall.description}</p>
                  )}
                  {activeStall.price && (
                    <p className="font-bold text-[#8E44FF]">Play Fee / Price: {activeStall.price}</p>
                  )}
                </div>
              ) : activeStall.status === 'pending' ? (
                <p className="text-xs font-semibold text-amber-700">
                  An application for lot {activeStall.stall_id} is awaiting review in the Applications Registry.
                </p>
              ) : (
                <p className="text-xs font-semibold text-stone-500">
                  This game booth lot is currently vacant and open for student booking.
                </p>
              )}
            </div>

            {/* Quick Override Button & Close */}
            <div className="shrink-0 flex items-center gap-2.5">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(activeStall.stall_id, activeStall.status)}
                  className="bg-[#121217] hover:bg-[#8E44FF] text-white px-4 py-2.5 rounded-xl font-black text-xs border border-[#121217] fest-shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Set {activeStall.status === 'occupied' ? 'Available' : 'Occupied'}
                </button>
              )}
              <button
                onClick={() => setSelectedStall(null)}
                className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
