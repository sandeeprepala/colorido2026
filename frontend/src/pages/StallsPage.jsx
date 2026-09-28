import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Utensils, 
  Gamepad2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight,
  PanelLeftClose, 
  PanelLeftOpen,
  Layers,
  ClipboardList
} from 'lucide-react';
import StallMap from '../components/stalls/StallMap';
import StallApplicationModal from '../components/stalls/StallApplicationModal';
import UserStallSidebar from '../components/stalls/UserStallSidebar';
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

  // Categorization & Sidebar state (like in admin)
  const [stallCategory, setStallCategory] = useState('food'); // 'food', 'game', 'all', 'my-apps'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
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

      {/* Two Stall Types Feature Strip (Interactive Switcher) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setStallCategory('food')}
          className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all flex items-start gap-4 ${
            stallCategory === 'food'
              ? 'bg-[#FFFDF9] border-[#FF7A00] ring-3 ring-[#FF7A00]/20 fest-shadow -translate-y-1'
              : 'bg-[#FFFDF9] border-[#121217] fest-shadow hover:-translate-y-0.5'
          }`}
        >
          <div className="p-3 bg-[#FF7A00] text-white rounded-2xl shrink-0 fest-shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-[#121217] mb-1">
                Food &amp; Beverage Stalls (F01 – F10)
              </h3>
              {stallCategory === 'food' && (
                <span className="text-[10px] font-black uppercase bg-orange-100 text-[#FF7A00] px-2 py-0.5 rounded-full border border-orange-200">
                  Active View
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Showcase student culinary creations, gourmet street food, artisan desserts, iced teas, and mocktails along Food Street East &amp; West.
            </p>
          </div>
        </div>

        <div 
          onClick={() => setStallCategory('game')}
          className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all flex items-start gap-4 ${
            stallCategory === 'game'
              ? 'bg-[#FFFDF9] border-[#8E44FF] ring-3 ring-[#8E44FF]/20 fest-shadow -translate-y-1'
              : 'bg-[#FFFDF9] border-[#121217] fest-shadow hover:-translate-y-0.5'
          }`}
        >
          <div className="p-3 bg-[#8E44FF] text-white rounded-2xl shrink-0 fest-shadow-sm">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-[#121217] mb-1">
                Carnival Game Stalls (G01 – G10)
              </h3>
              {stallCategory === 'game' && (
                <span className="text-[10px] font-black uppercase bg-purple-100 text-[#8E44FF] px-2 py-0.5 rounded-full border border-purple-200">
                  Active View
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Design fun interactive games: ring toss, VR immersion, archery challenge, mini golf, or retro arcades at the Central Carnival Lawn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Categorized Section with Collapsible Sidebar */}
      <div className="space-y-6">
        
        {/* Section Header with Toggle Sidebar Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121217]">
              {stallCategory === 'food'
                ? '🍔 FOOD STREET BOULEVARD'
                : stallCategory === 'game'
                ? '🎯 CENTRAL CARNIVAL GAME ARENA'
                : stallCategory === 'my-apps'
                ? '📋 MY STALL APPLICATIONS'
                : '🎪 ALL FESTIVAL STALL LOTS'}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-stone-500">
              {stallCategory === 'food'
                ? 'Browse available lots F01 - F10, check menu items, and reserve for your team'
                : stallCategory === 'game'
                ? 'Browse game lots G01 - G10, VR setups, challenges, and arcade lots'
                : stallCategory === 'my-apps'
                ? 'Track real-time approval status for your submitted applications'
                : 'Interactive physical campus occupancy floor-plan'}
            </p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white hover:bg-stone-50 text-[#121217] px-4 py-2.5 rounded-2xl font-black text-xs border-2 border-[#121217] fest-shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            title={isSidebarOpen ? 'Collapse categories sidebar' : 'Expand categories sidebar'}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-stone-600" />
                <span>Hide Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-[#FF7A00]" />
                <span>Show Categories Sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* Flex Layout: Sidebar + Dynamic Zone Content */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* Side Navbar (Collapsible) */}
          <UserStallSidebar
            activeSection={stallCategory}
            setActiveSection={setStallCategory}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            stalls={stalls}
            myApplications={myApplications}
            isAuthenticated={isAuthenticated}
          />

          {/* Dynamic Content View */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            
            {/* View 1: Food, Game, or All Map */}
            {(stallCategory === 'food' || stallCategory === 'game' || stallCategory === 'all') && (
              <StallMap
                stalls={stalls}
                selectedStall={selectedStall}
                onSelectStall={handleSelectStall}
                onApplyClick={handleApplyClick}
                defaultFilter={stallCategory}
              />
            )}

            {/* View 2: My Stall Applications Tracker */}
            {stallCategory === 'my-apps' && (
              <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-display font-black text-xl text-[#121217]">
                      MY STALL APPLICATIONS ({myApplications.length})
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold">
                      Realtime Committee Status Tracker
                    </p>
                  </div>

                  <button
                    onClick={() => setStallCategory('food')}
                    className="bg-[#121217] hover:bg-[#FF7A00] text-white px-4 py-2 rounded-xl font-black text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD43B]" />
                    <span>Apply for Another Stall</span>
                  </button>
                </div>

                {myApplications.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ClipboardList className="w-12 h-12 text-stone-300 mx-auto" />
                    <h4 className="font-display font-black text-lg text-stone-800">No Applications Yet</h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      You haven't submitted any stall booking requests yet. Browse the Food Street or Carnival Game Arena to pick an available lot!
                    </p>
                    <button
                      onClick={() => setStallCategory('food')}
                      className="bg-[#FF7A00] hover:bg-[#e06b00] text-white px-5 py-2.5 rounded-full font-black text-xs border border-[#121217] fest-shadow-sm transition-all inline-flex items-center gap-1.5 mt-2"
                    >
                      <Utensils className="w-4 h-4" />
                      Browse Available Food Stalls
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-3"
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

                        <div>
                          <p className="text-sm font-bold text-stone-900">{app.item_name}</p>
                          <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">{app.description}</p>
                        </div>
                        
                        <div className="text-[11px] font-semibold text-stone-500 pt-2 border-t border-stone-200 flex justify-between">
                          <span>Price / Play Fee: <strong className="text-stone-800">{app.price || 'Free'}</strong></span>
                          <span>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Persistent Applications Card at bottom when in map view if user has apps */}
      {isAuthenticated && myApplications.length > 0 && stallCategory !== 'my-apps' && (
        <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 sm:p-7 fest-shadow space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-5 h-5 text-[#E91E63]" />
              <h3 className="font-display font-black text-lg text-[#121217]">
                YOUR ACTIVE APPLICATIONS ({myApplications.length})
              </h3>
            </div>
            <button
              onClick={() => setStallCategory('my-apps')}
              className="text-xs font-black text-[#8E44FF] hover:underline flex items-center gap-1"
            >
              <span>View Full Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-2xl border-2 border-stone-200 bg-stone-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-sm text-[#121217]">Lot {app.stall_id}</span>
                  <p className="text-xs font-bold text-stone-700 truncate max-w-[140px]">{app.item_name}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  app.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : app.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Modal */}
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
