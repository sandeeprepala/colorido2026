import React from 'react';
import { 
  Utensils, 
  Gamepad2, 
  ClipboardCheck, 
  Store, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';

export default function StallAdminSidebar({
  activeSection,
  setActiveSection,
  isOpen,
  onToggle,
  stalls = [],
  stallApps = []
}) {
  const foodCount = stalls.filter((s) => s.type === 'food').length;
  const gameCount = stalls.filter((s) => s.type === 'game').length;
  const pendingAppsCount = stallApps.filter((a) => a.status === 'pending').length;

  const navItems = [
    {
      id: 'food',
      title: 'Food Street Boulevard',
      subtitle: 'Artisan bites & beverage lots',
      lotCount: `${foodCount || 10} Lots`,
      icon: Utensils,
      color: '#FF7A00',
      activeBg: 'bg-orange-50 border-[#FF7A00] text-[#121217]',
      badgeBg: 'bg-orange-100 text-[#FF7A00] border-orange-200',
    },
    {
      id: 'game',
      title: 'Central Carnival Game Arena',
      subtitle: 'VR, arcade & challenge lots',
      lotCount: `${gameCount || 10} Lots`,
      icon: Gamepad2,
      color: '#8E44FF',
      activeBg: 'bg-purple-50 border-[#8E44FF] text-[#121217]',
      badgeBg: 'bg-purple-100 text-[#8E44FF] border-purple-200',
    },
    {
      id: 'applications',
      title: 'Stall Applications Registry',
      subtitle: 'Student booking requests',
      lotCount: `${stallApps.length} Apps`,
      icon: ClipboardCheck,
      color: '#FFD43B',
      activeBg: 'bg-amber-50 border-[#121217] text-[#121217]',
      badgeBg: pendingAppsCount > 0 ? 'bg-amber-400 text-black animate-pulse' : 'bg-stone-100 text-stone-700 border-stone-200',
      alert: pendingAppsCount > 0 ? `${pendingAppsCount} pending` : null,
    },
    {
      id: 'all-lots',
      title: 'All Festival Stall Lots',
      subtitle: 'Quick status overrides',
      lotCount: `${stalls.length} Lots`,
      icon: Store,
      color: '#00C49F',
      activeBg: 'bg-emerald-50 border-emerald-600 text-[#121217]',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'view-all',
      title: 'View All Sections',
      subtitle: 'Full combined dashboard view',
      lotCount: 'Overview',
      icon: Layers,
      color: '#121217',
      activeBg: 'bg-stone-100 border-[#121217] text-[#121217]',
      badgeBg: 'bg-stone-200 text-stone-800 border-stone-300',
    }
  ];

  // If sidebar is collapsed (closed)
  if (!isOpen) {
    return (
      <aside className="shrink-0">
        {/* Desktop Slim Icon Rail */}
        <div className="hidden lg:flex flex-col items-center bg-white border-2 border-[#121217] rounded-3xl p-2.5 fest-shadow space-y-3 w-16">
          <button
            onClick={onToggle}
            className="p-2.5 rounded-xl border border-stone-300 hover:bg-[#121217] hover:text-white transition-all cursor-pointer text-stone-700"
            title="Open Stall Navigation Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>

          <div className="w-full border-t border-stone-200 my-1"></div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={`${item.title} (${item.lotCount})`}
                className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#121217] bg-[#121217] text-white shadow-sm -translate-y-0.5'
                    : 'border-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.alert && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile quick button when closed */}
        <div className="lg:hidden mb-4">
          <button
            onClick={onToggle}
            className="w-full bg-white border-2 border-[#121217] rounded-2xl p-3 fest-shadow-sm flex items-center justify-between font-black text-xs cursor-pointer hover:bg-stone-50"
          >
            <span className="flex items-center gap-2">
              <PanelLeftOpen className="w-4 h-4 text-[#FF7A00]" />
              <span>STALL SECTIONS MENU</span>
            </span>
            <span className="bg-stone-100 px-2.5 py-1 rounded-full text-stone-600 border border-stone-200">
              Open Sidebar &rarr;
            </span>
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar
  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <div className="bg-white border-2 border-[#121217] rounded-3xl p-5 fest-shadow space-y-4">
        
        {/* Sidebar Header with Close Button */}
        <div className="flex items-center justify-between border-b-2 border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E91E63]"></span>
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#121217]">
              Stall Sections
            </h3>
          </div>

          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs font-black text-stone-600 hover:text-black p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Close sidebar navigation"
          >
            <PanelLeftClose className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                  isActive
                    ? `${item.activeBg} border-2 fest-shadow-sm -translate-y-0.5`
                    : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div
                  className="p-2 rounded-xl text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-black text-xs text-[#121217] truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-semibold truncate">
                    {item.subtitle}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeBg}`}
                    >
                      {item.lotCount}
                    </span>
                    {item.alert && (
                      <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                        {item.alert}
                      </span>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="w-1.5 h-6 rounded-full bg-[#121217] self-center shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stall Quick Stats Mini Box */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
          <p className="font-black uppercase tracking-wider text-[10px] text-stone-400">
            Occupancy Overview
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px]">Total Lots</span>
              <span className="font-black text-stone-900">{stalls.length} Lots</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px]">Pending Apps</span>
              <span className="font-black text-amber-700">{pendingAppsCount} Review</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
