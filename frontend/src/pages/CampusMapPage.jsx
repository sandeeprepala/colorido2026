import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Compass, Sun, Moon, RotateCcw, Play, Square,
  ExternalLink, Search, Sparkles, Navigation, Layers,
  Utensils, Trophy, Laptop, Flag, X, ArrowRight, Eye,
  Info, CheckCircle2, ChevronRight, ChevronLeft
} from 'lucide-react';
import Campus3DViewer, { CAMPUS_LOCATIONS } from '../components/map/Campus3DViewer';

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/R.V.R.+%26+J.C.College+of+Engineering/@16.2547442,80.3234829,483m/data=!3m1!1e3!4m6!3m5!1s0x3a4a76e740000001:0xc41c8498715c6da0!8m2!3d16.2550851!4d80.324054!16zL20vMGZ3Z3J4?hl=en&entry=ttu&g_ep=EgoyMDI2MDkyNy4xIKXMDSoASAFQAw%3D%3D';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Zones', icon: Layers },
  { id: 'academic', label: 'Academic Blocks', icon: Laptop },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'stalls', label: 'Festival Stalls', icon: Sparkles },
  { id: 'games', label: 'Carnival & Games', icon: Flag },
  { id: 'sports', label: 'Sports Arena', icon: Trophy },
];

export default function CampusMapPage() {
  const viewerRef = useRef(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tourStep, setTourStep] = useState(null); // null when not in tour mode

  const activeLocation = CAMPUS_LOCATIONS.find((l) => l.id === selectedLocationId);

  // Filter locations
  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesCategory =
      activeCategory === 'all' || loc.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.festRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle Guided Tour progression
  useEffect(() => {
    if (tourStep === null) return;
    const loc = CAMPUS_LOCATIONS[tourStep];
    if (loc) {
      setSelectedLocationId(loc.id);
      if (viewerRef.current) {
        viewerRef.current.focusLocation(loc.id);
      }
    }
  }, [tourStep]);

  const startTour = () => {
    setTourStep(0);
    setIsAutoRotate(false);
  };

  const stopTour = () => {
    setTourStep(null);
  };

  const nextTourStep = () => {
    if (tourStep === null) return;
    if (tourStep < CAMPUS_LOCATIONS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      stopTour();
    }
  };

  const prevTourStep = () => {
    if (tourStep !== null && tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const handleSelectLocation = (id) => {
    setSelectedLocationId(id);
    if (viewerRef.current) {
      viewerRef.current.focusLocation(id);
    }
  };

  const handleResetCamera = () => {
    setSelectedLocationId(null);
    setTourStep(null);
    if (viewerRef.current) {
      viewerRef.current.resetCamera();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#121217]">
      {/* 1. HERO & FESTIVAL CAMPUS BANNER */}
      <section className="bg-white border-b-2 border-[#121217] pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Context */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19CFE8]/20 border border-[#19CFE8] text-[#121217] text-xs font-black uppercase tracking-wider mb-2.5">
                <Compass className="w-3.5 h-3.5 text-[#121217] animate-spin-slow" />
                R.V.R. & J.C. College of Engineering • Guntur
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-[#121217]">
                CAMPUS <span className="text-[#E91E63]">3D</span> EXPLORER
              </h1>
              <p className="text-stone-600 font-medium text-sm sm:text-base max-w-2xl mt-1.5">
                Interactive spatial guide for <strong className="text-[#121217]">COLORIDO '26</strong>. Locate academic blocks, food courts, carnival stalls, and games arenas across our vibrant campus.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-stone-100 hover:bg-stone-200 border-2 border-[#121217] fest-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                Google Maps Live
              </a>

              <button
                onClick={startTour}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#8E44FF] text-white border-2 border-[#121217] fest-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Start 3D Tour
              </button>
            </div>

          </div>

          {/* Quick Filter Tabs & Search */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-stone-200">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_TABS.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                      active
                        ? 'bg-[#121217] text-white border-[#121217] shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-[#121217]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search block, stall, food..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 border-[#121217] bg-[#FAF8F5] focus:outline-none focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#121217]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3D INTERACTIVE VIEWPORT CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative w-full h-[580px] sm:h-[660px] md:h-[720px] rounded-3xl border-3 border-[#121217] overflow-hidden fest-shadow-lg bg-[#dcecf8] shadow-2xl">
          
          {/* 3D WebGL Canvas */}
          <Campus3DViewer
            ref={viewerRef}
            selectedLocationId={selectedLocationId}
            onSelectLocation={handleSelectLocation}
            isNightMode={isNightMode}
            isAutoRotate={isAutoRotate}
            isTourActive={tourStep !== null}
          />

          {/* HUD Floating Controls (Top Right) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {/* Night / Day Mode Toggle */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              title={isNightMode ? 'Switch to Daytime' : 'Switch to Festival Night Lights'}
              className={`p-2.5 rounded-2xl border-2 border-[#121217] fest-shadow-sm transition-all hover:scale-105 ${
                isNightMode
                  ? 'bg-[#192138] text-[#FFD43B]'
                  : 'bg-white text-amber-500'
              }`}
            >
              {isNightMode ? <Moon className="w-5 h-5 fill-[#FFD43B]" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Auto-Rotate Camera Orbit"
              className={`p-2.5 rounded-2xl border-2 border-[#121217] fest-shadow-sm transition-all hover:scale-105 ${
                isAutoRotate ? 'bg-[#19CFE8] text-[#121217]' : 'bg-white text-stone-700'
              }`}
            >
              <Navigation className={`w-5 h-5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            </button>

            {/* Reset View */}
            <button
              onClick={handleResetCamera}
              title="Reset to Campus Overview"
              className="p-2.5 rounded-2xl border-2 border-[#121217] bg-white text-stone-700 fest-shadow-sm transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Jump Bar (Floating Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-[#121217] fest-shadow-sm max-w-[calc(100%-32px)] overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black uppercase text-stone-400 px-2 tracking-wider">
              Quick Jump:
            </span>
            {CAMPUS_LOCATIONS.map((loc) => {
              const active = selectedLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#121217] text-white shadow-sm'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  {loc.name.split(' (')[0]}
                </button>
              );
            })}
          </div>

          {/* In-Canvas Helper Pill (Top Left) */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border-2 border-[#121217] fest-shadow-sm text-[11px] font-bold text-stone-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Left-Click + Drag: Rotate • Right-Click: Pan • Scroll: Zoom</span>
            </div>
          </div>

          {/* GUIDED TOUR ACTIVE OVERLAY */}
          {tourStep !== null && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-[500px]">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#121217] text-white border-2 border-white fest-shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#19CFE8]">
                    Guided Campus Tour ({tourStep + 1} of {CAMPUS_LOCATIONS.length})
                  </span>
                  <button
                    onClick={stopTour}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display font-black text-lg text-white">
                  {CAMPUS_LOCATIONS[tourStep].name}
                </h3>
                <p className="text-stone-300 text-xs mt-1 leading-relaxed line-clamp-2">
                  {CAMPUS_LOCATIONS[tourStep].description}
                </p>

                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-800">
                  <button
                    onClick={prevTourStep}
                    disabled={tourStep === 0}
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {CAMPUS_LOCATIONS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === tourStep ? 'w-5 bg-[#E91E63]' : 'bg-stone-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextTourStep}
                    className="inline-flex items-center gap-1 text-xs font-black bg-[#E91E63] text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    {tourStep === CAMPUS_LOCATIONS.length - 1 ? 'Finish Tour' : 'Next Stop'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL DRAWER / SLIDEOVER (When a location is selected and not in tour mode) */}
          <AnimatePresence>
            {activeLocation && tourStep === null && (
              <motion.div
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.25 }}
                className="absolute top-4 right-4 bottom-4 z-30 w-full sm:w-[380px] bg-white rounded-3xl border-3 border-[#121217] fest-shadow-xl overflow-hidden flex flex-col"
              >
                {/* Drawer Header */}
                <div
                  className="p-5 text-white relative flex flex-col justify-end min-h-[120px]"
                  style={{ backgroundColor: activeLocation.badgeColor }}
                >
                  <button
                    onClick={() => setSelectedLocationId(null)}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm">
                    {activeLocation.categoryLabel}
                  </span>
                  <h2 className="font-display font-black text-xl text-white drop-shadow-sm leading-tight">
                    {activeLocation.name}
                  </h2>
                  <span className="text-xs font-bold text-white/90 font-sans mt-0.5">
                    {activeLocation.teluguName}
                  </span>
                </div>

                {/* Drawer Body (Scrollable) */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                  {/* Festival Role Banner */}
                  <div className="p-3.5 rounded-2xl bg-stone-100 border-2 border-[#121217]">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#121217] uppercase tracking-wide mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
                      COLORIDO '26 Fest Role
                    </div>
                    <p className="text-xs font-bold text-stone-800 leading-snug">
                      {activeLocation.festRole}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-1.5">
                      Overview
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {activeLocation.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2">
                      Key Highlights & Activities
                    </h4>
                    <ul className="space-y-2">
                      {activeLocation.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-bold text-stone-800">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Road & Access */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-300">
                    <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block mb-0.5">
                      Access Road / Gate
                    </span>
                    <span className="text-xs font-bold text-[#121217]">
                      📍 {activeLocation.roadAccess}
                    </span>
                  </div>

                  {/* Action Links */}
                  <div className="pt-2 space-y-2">
                    {activeLocation.category === 'food' || activeLocation.category === 'stalls' ? (
                      <Link
                        to="/stalls"
                        className="w-full py-2.5 rounded-xl font-black text-xs bg-[#FF7A00] text-white border-2 border-[#121217] fest-shadow-sm flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        Browse Festival Stalls
                      </Link>
                    ) : (
                      <Link
                        to="/events"
                        className="w-full py-2.5 rounded-xl font-black text-xs bg-[#19CFE8] text-[#121217] border-2 border-[#121217] fest-shadow-sm flex items-center justify-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Explore Events & Schedule
                      </Link>
                    )}

                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl font-bold text-xs bg-white text-stone-700 border-2 border-stone-300 flex items-center justify-center gap-1.5 hover:border-[#121217] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View on Satellite Map
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 3. CAMPUS LANDMARKS DIRECTORY (CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#121217]">
              Campus Landmarks Directory
            </h2>
            <p className="text-stone-600 text-sm font-medium mt-1">
              Select any zone to zoom into the 3D model and view fest activity schedules.
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-stone-200 text-stone-700 border border-stone-300 w-fit">
            Showing {filteredLocations.length} Locations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocationId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc.id)}
                className={`group cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#121217] bg-white ring-4 ring-[#19CFE8]/30 fest-shadow-md translate-y-[-2px]'
                    : 'border-[#121217] bg-white fest-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: loc.badgeColor }}
                    >
                      {loc.categoryLabel}
                    </span>
                    <span className="text-[11px] font-bold text-stone-400 font-sans">
                      {loc.teluguName}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-[#121217] group-hover:text-[#E91E63] transition-colors leading-snug">
                    {loc.name}
                  </h3>

                  <p className="text-stone-600 text-xs font-medium mt-1.5 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200">
                    <span className="text-[10px] font-black uppercase text-[#E91E63] tracking-wide block mb-0.5">
                      Fest Focus
                    </span>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">
                      {loc.festRole}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#121217]" />
                    {loc.roadAccess}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLocation(loc.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-black text-[#121217] group-hover:text-[#E91E63] transition-colors"
                  >
                    Inspect in 3D
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
