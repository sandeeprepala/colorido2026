import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Activity, Shield, Users, Radio, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { leaderboardAPI } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboards = async () => {
    try {
      const res = await leaderboardAPI.getAllLeaderboards();
      const list = res.data.leaderboards || [];
      setLeaderboards(list);
      if (!activeBoardId && list.length > 0) {
        setActiveBoardId(list[0].id);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  // Realtime SSE listener for score updates
  useRealtime({
    LEADERBOARD_UPDATED: (updatedBoard) => {
      console.log('[Realtime] Leaderboard updated:', updatedBoard);
      setLeaderboards((prev) =>
        prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
      );
    },
  });

  const activeBoard = leaderboards.find((b) => b.id === activeBoardId) || leaderboards[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            LIVE MATCH
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-xs font-black uppercase">
            UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#16A34A] bg-emerald-100 px-3 py-1 rounded-full inline-block border border-emerald-200">
          SPORTS TOURNAMENT ARENA
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          LIVE LEADERBOARD
        </h1>
        <p className="font-semibold text-stone-600 text-sm sm:text-base">
          Realtime match scores, points tables, and team standings broadcast directly from the sports turf.
        </p>
      </div>

      {/* Sport Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 relative">
        {leaderboards.map((b) => {
          const isSelected = activeBoard?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActiveBoardId(b.id)}
              className={`relative isolate px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-[#121217] transition-colors flex items-center gap-2 cursor-pointer select-none ${
                isSelected ? '' : 'bg-white hover:bg-stone-50'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="leaderboard-sport-capsule"
                  className="absolute inset-0 bg-[#121217] rounded-[14px] z-0 fest-shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              <Trophy className={`w-4 h-4 relative z-10 transition-colors ${isSelected ? 'text-[#FFD43B]' : 'text-stone-700'}`} />
              <span className={`relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                {b.sport_name}
              </span>
              {b.status === 'LIVE' && (
                <span className="relative z-10 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tournament Match Board */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-[#121217] border-t-[#16A34A] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-stone-500">Connecting to realtime sports channel...</p>
        </div>
      ) : activeBoard ? (
        <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow-lg space-y-6">
          
          {/* Header Info Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121217]">
                  {activeBoard.sport_name}
                </h2>
                {getStatusBadge(activeBoard.status)}
              </div>
              <p className="text-xs font-bold text-stone-500">
                Fixtures &amp; Score: {activeBoard.match_info || 'Tournament round underway'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Auto-refreshing via Supabase Realtime SSE</span>
            </div>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#121217] text-stone-500 uppercase tracking-wider text-[11px] font-black">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team / Contingent</th>
                  <th className="py-3 px-4">Captains &amp; Squad</th>
                  <th className="py-3 px-4 text-center">Form</th>
                  <th className="py-3 px-4 text-right">Match Score</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs sm:text-sm font-bold">
                {activeBoard.entries?.map((entry, idx) => (
                  <tr
                    key={entry.id || idx}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-[#FFD43B] text-black border border-[#121217]'
                          : idx === 1
                          ? 'bg-stone-200 text-black'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {entry.rank || idx + 1}
                      </span>
                    </td>

                    {/* Team Name */}
                    <td className="py-4 px-4 font-display font-black text-base text-[#121217]">
                      {entry.team_name}
                    </td>

                    {/* Participant / Squad */}
                    <td className="py-4 px-4 text-stone-600 font-semibold text-xs">
                      {entry.participant_name || 'Varsity Squad'}
                    </td>

                    {/* Form */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-xs tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        {entry.form || 'W-W'}
                      </span>
                    </td>

                    {/* Match Score */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-stone-800">
                      {entry.score}
                    </td>

                    {/* Points */}
                    <td className="py-4 px-4 text-right font-mono font-black text-base text-[#16A34A]">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-semibold gap-2">
            <span>Points determine tournament semi-final advancement &amp; trophy standings.</span>
            <span>Official referee scorekeeper console active.</span>
          </div>

        </div>
      ) : null}

    </div>
  );
}
