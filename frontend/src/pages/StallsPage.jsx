import React, { useState, useEffect } from 'react';
import { Store, Utensils, Gamepad2, Sparkles, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import StallMap from '../components/stalls/StallMap';
import StallApplicationModal from '../components/stalls/StallApplicationModal';
import { stallsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export default function StallsPage() {
  const { user, isAuthenticated } = useAuth();
  const [stalls, setStalls] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStallsData = async () => {
    try {
      const res = await stallsAPI.getStalls();
      setStalls(res.data.stalls || []);
      if (selectedStall) {
        const refreshed = (res.data.stalls || []).find((s) => s.stall_id === selectedStall.stall_id);
        if (refreshed) setSelectedStall(refreshed);
      }
    } catch (err) {
      console.error('Failed to fetch stalls:', err);
    }
  };

  const fetchMyApps = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await stallsAPI.getMyApplications();
      setMyApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch my stall applications:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStallsData(), fetchMyApps()]);
      setLoading(false);
    };
    init();
  }, [isAuthenticated]);

  // Realtime SSE listener for stall status changes
  useRealtime({
    STALL_UPDATED: (payload) => {
      console.log('[Realtime] Stall updated:', payload);
      fetchStallsData();
      fetchMyApps();
    },
  });

  const handleSelectStall = (stall) => {
    setSelectedStall(stall);
  };

  const handleApplyClick = (stall) => {
    setSelectedStall(stall);
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = (newApp) => {
    setShowApplyModal(false);
    fetchStallsData();
    fetchMyApps();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#FF7A00] bg-orange-100 px-3.5 py-1 rounded-full inline-block border border-orange-200">
          STUDENT CARNIVAL &amp; FOOD BOULEVARD
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          FESTIVAL STALLS
        </h1>
        <p className="font-hand text-2xl sm:text-3xl text-stone-700">
          "Set up your own experience at the festival."
        </p>
        <p className="text-sm sm:text-base text-stone-600 font-medium">
          Select an available lot on the graphical floor-plan below. Fill in your menu or gameplay details to reserve your booth for thousands of festival visitors!
        </p>
      </div>

      {/* Two Stall Types Feature Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-3xl p-6 sm:p-7 fest-shadow flex items-start gap-4">
          <div className="p-3 bg-[#FF7A00] text-white rounded-2xl shrink-0 fest-shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-[#121217] mb-1">
              Food &amp; Beverage Stalls (F01 – F10)
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Showcase student culinary creations, gourmet street food, artisan desserts, iced teas, and mocktails along Food Street East &amp; West.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border-2 border-[#121217] rounded-3xl p-6 sm:p-7 fest-shadow flex items-start gap-4">
          <div className="p-3 bg-[#8E44FF] text-white rounded-2xl shrink-0 fest-shadow-sm">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-[#121217] mb-1">
              Carnival Game Stalls (G01 – G10)
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Design fun interactive games: ring toss, VR immersion, archery challenge, mini golf, or retro arcades at the Central Carnival Lawn.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visual Stall Map */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-2xl text-[#121217]">
            INTERACTIVE CAMPUS FLOOR-PLAN
          </h2>
          <span className="text-xs font-bold text-stone-500">
            Click any stall lot to inspect or apply
          </span>
        </div>

        <StallMap
          stalls={stalls}
          selectedStall={selectedStall}
          onSelectStall={handleSelectStall}
          onApplyClick={handleApplyClick}
        />
      </div>

      {/* Student's Applied Stalls Status Section */}
      {isAuthenticated && myApplications.length > 0 && (
        <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-display font-black text-xl text-[#121217]">
              MY STALL APPLICATIONS ({myApplications.length})
            </h3>
            <span className="text-xs font-bold text-stone-500">Realtime Status Tracker</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-lg text-[#121217]">
                    Stall {app.stall_id} ({app.type.toUpperCase()})
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    app.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs font-bold text-stone-900">{app.item_name}</p>
                <p className="text-xs text-stone-600 line-clamp-2">{app.description}</p>
                
                <div className="text-[11px] font-semibold text-stone-500 pt-1 border-t border-stone-200 flex justify-between">
                  <span>Price: {app.price}</span>
                  <span>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showApplyModal && selectedStall && (
        <StallApplicationModal
          stall={selectedStall}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}

    </div>
  );
}
