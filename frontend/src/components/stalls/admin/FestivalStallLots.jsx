import React, { useState } from 'react';
import { Store, Utensils, Gamepad2, Filter } from 'lucide-react';

export default function FestivalStallLots({ stalls = [], onToggleStatus }) {
  const [filterType, setFilterType] = useState('all');

  const filteredStalls = stalls.filter((s) => {
    if (filterType === 'all') return true;
    if (filterType === 'food') return s.type === 'food';
    if (filterType === 'game') return s.type === 'game';
    if (filterType === 'available') return s.status === 'available';
    if (filterType === 'occupied') return s.status === 'occupied';
    return true;
  });

  const foodCount = stalls.filter((s) => s.type === 'food').length;
  const gameCount = stalls.filter((s) => s.type === 'game').length;
  const occupiedCount = stalls.filter((s) => s.status === 'occupied').length;
  const availableCount = stalls.filter((s) => s.status === 'available').length;

  return (
    <div className="bg-white border-2 border-[#121217] rounded-3xl p-5 sm:p-7 fest-shadow space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-[#00C49F] text-white fest-shadow-sm shrink-0">
            <Store className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#121217]">
                All Festival Stall Lots ({stalls.length})
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-500">
              Click any stall lot below to toggle occupancy status or reserve for university student clubs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            Available: <strong className="text-emerald-700">{availableCount}</strong> · Occupied: <strong className="text-rose-700">{occupiedCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 text-xs font-bold">
        <span className="text-stone-400 uppercase tracking-wider text-[11px] px-2">Zone:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'all' ? 'bg-[#121217] text-white shadow-xs' : 'text-stone-700 hover:text-black hover:bg-white'
          }`}
        >
          All Lots ({stalls.length})
        </button>
        <button
          onClick={() => setFilterType('food')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
            filterType === 'food' ? 'bg-[#FF7A00] text-white shadow-xs' : 'text-stone-700 hover:text-black hover:bg-white'
          }`}
        >
          <Utensils className="w-3 h-3" /> Food Street ({foodCount})
        </button>
        <button
          onClick={() => setFilterType('game')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
            filterType === 'game' ? 'bg-[#8E44FF] text-white shadow-xs' : 'text-stone-700 hover:text-black hover:bg-white'
          }`}
        >
          <Gamepad2 className="w-3 h-3" /> Carnival Games ({gameCount})
        </button>
        <button
          onClick={() => setFilterType('available')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'available' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black hover:bg-white'
          }`}
        >
          Available Only ({availableCount})
        </button>
        <button
          onClick={() => setFilterType('occupied')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'occupied' ? 'bg-rose-700 text-white shadow-xs' : 'text-stone-700 hover:text-black hover:bg-white'
          }`}
        >
          Occupied Only ({occupiedCount})
        </button>
      </div>

      {/* Grid of Stall Lots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredStalls.map((s) => (
          <div
            key={s.stall_id}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              s.status === 'occupied'
                ? 'bg-rose-50 border-rose-300'
                : s.status === 'pending'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-emerald-50 border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-sm text-[#121217]">{s.stall_id}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    s.status === 'occupied'
                      ? 'bg-rose-200 text-rose-900'
                      : s.status === 'pending'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-700 truncate mb-1">
                {s.status === 'occupied'
                  ? (s.item_name || s.name || (s.type === 'food' ? 'Food Stall' : 'Game Stall'))
                  : s.status === 'pending'
                  ? 'Under Review'
                  : 'Available Lot'}
              </p>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
                {s.type === 'food' ? '🍔 Food' : '🎯 Game'} · {s.status === 'occupied' ? (s.applicant_name || 'Assigned') : s.status === 'pending' ? 'Review Pending' : 'Ready to Book'}
              </p>
            </div>

            <button
              onClick={() => onToggleStatus(s.stall_id, s.status)}
              className="w-full text-[11px] font-black py-1.5 rounded-xl border border-[#121217] bg-white hover:bg-stone-100 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              Set {s.status === 'occupied' ? 'Available' : 'Occupied'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
