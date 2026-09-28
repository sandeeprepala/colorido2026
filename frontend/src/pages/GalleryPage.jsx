import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Download, Eye, Camera, Film, Layers } from 'lucide-react';
import { getOptimizedImageUrl, handleImageFallback } from '../utils/cloudinary';

export default function GalleryPage() {
  const galleryItems = [
    {
      id: 'gal-1',
      title: 'Rujangna Festival Showcase',
      category: 'Cultural',
      img: '/gallery/rujangna-2025.jpeg',
      description: 'Annual college cultural extravaganza and festival celebration kickoff.',
      tag: 'Cultural Nights',
    },
    {
      id: 'gal-2',
      title: 'Main Arena Concert & Crowd Euphoria',
      category: 'Celebration',
      img: '/gallery/6.jpg',
      description: 'Electric crowd vibrations under the main stage lights.',
      tag: 'Live Concert',
    },
    {
      id: 'gal-3',
      title: 'Stage Spotlight & Musical Battle',
      category: 'Cultural',
      img: '/gallery/22.jpg',
      description: 'Bands battle under cinematic stage lighting and live audio rigs.',
      tag: 'Battle of Bands',
    },
    {
      id: 'gal-4',
      title: 'Dance Cypher & Street Showcase',
      category: 'Cultural',
      img: '/gallery/23.jpg',
      description: 'High-octane choreography and street battle dance performances.',
      tag: 'Step Up Dance',
    },
    {
      id: 'gal-5',
      title: 'Evening Fest Celebrations',
      category: 'Celebration',
      img: '/gallery/26.jpg',
      description: 'Sunset celebrations and campus festival lighting.',
      tag: 'Campus Euphoria',
    },
    {
      id: 'gal-6',
      title: 'Grand Finale Showcase',
      category: 'Celebration',
      img: '/gallery/30.jpg',
      description: 'Festival closing ceremony, fireworks, and trophy presentations.',
      tag: 'Grand Finale',
    },
    {
      id: 'gal-7',
      title: 'Innovation & Robotics Arena',
      category: 'Technical',
      img: '/gallery/I1.jpg',
      description: 'High-speed autonomous bot race and tech team showdowns.',
      tag: 'Robo Grand Prix',
    },
    {
      id: 'gal-8',
      title: 'Hackathon Sprint & Code Clash',
      category: 'Technical',
      img: '/gallery/I2.jpg',
      description: 'Developers hacking through the night for the top prize pool.',
      tag: 'Code Clash',
    },
    {
      id: 'gal-9',
      title: 'Podium Medals & Trophy Presentation',
      category: 'Sports',
      img: '/gallery/I8.jpg',
      description: 'Champions crowned on the podium with gold medals and certificates.',
      tag: 'Victory Podium',
    },
    {
      id: 'gal-10',
      title: 'Varsity Tournament Highlights',
      category: 'Sports',
      img: '/gallery/i32.jpg',
      description: 'Fierce competition on the college turf and indoor arena.',
      tag: 'Varsity Sports',
    },
    {
      id: 'gal-11',
      title: 'Festival Art & Visuals — Chapter I',
      category: 'Design',
      img: '/gallery/tt.png',
      description: 'Official COLORIDO festival artwork and commemorative graphics.',
      tag: 'Festival Art',
    },
    {
      id: 'gal-12',
      title: 'Festival Art & Visuals — Chapter II',
      category: 'Design',
      img: '/gallery/tt-1.png',
      description: 'Commemorative visual designs and festival theme illustration.',
      tag: 'Visual Identity',
    },
    {
      id: 'gal-13',
      title: 'Festival Art & Visuals — Chapter III',
      category: 'Design',
      img: '/gallery/tt-2.png',
      description: 'Celebratory typography and festival branding emblem.',
      tag: 'Brand Emblem',
    },
  ];

  const [activeFilter, setActiveFilter] = useState('All');
  const [activeModalIdx, setActiveModalIdx] = useState(null);

  const categories = ['All', 'Cultural', 'Technical', 'Sports', 'Celebration', 'Design'];

  const filteredItems = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase());

  const handleNext = () => {
    if (activeModalIdx === null) return;
    setActiveModalIdx((activeModalIdx + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (activeModalIdx === null) return;
    setActiveModalIdx((activeModalIdx - 1 + filteredItems.length) % filteredItems.length);
  };

  const activePhoto = activeModalIdx !== null ? filteredItems[activeModalIdx] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E91E63] bg-pink-100 px-3.5 py-1.5 rounded-full border border-pink-200">
          <Camera className="w-3.5 h-3.5 text-[#E91E63]" />
          <span>FESTIVAL MEMORIES &amp; REAL PHOTOS</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          PHOTO GALLERY
        </h1>
        <p className="font-semibold text-stone-600 text-sm sm:text-base">
          Authentic moments from COLORIDO college festival — showcasing real performances, crowd excitement, podium trophies, and stage energy.
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-2 rounded-2xl border-2 border-[#121217] fest-shadow-sm max-w-fit mx-auto relative">
        {categories.map((cat) => {
          const isSelected = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                setActiveModalIdx(null);
              }}
              className="relative isolate px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-colors cursor-pointer select-none"
            >
              {isSelected && (
                <motion.span
                  layoutId="gallery-category-capsule"
                  className="absolute inset-0 bg-[#121217] rounded-xl z-0 shadow-xs"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-stone-700 hover:text-black'}`}>
                {cat === 'All' ? '✨ All Photos (' + galleryItems.length + ')' : `${cat}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setActiveModalIdx(idx)}
            className="group relative rounded-3xl border-2 border-[#121217] bg-white fest-shadow overflow-hidden hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col"
          >
            {/* Image Container */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-100 border-b-2 border-[#121217]">
              <img
                src={getOptimizedImageUrl(item.img, { width: 800 })}
                onError={(e) => handleImageFallback(e, item.img)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/95 text-[#121217] px-4 py-2 rounded-full font-black text-xs border border-[#121217] fest-shadow-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
                </span>
              </div>

              {/* Tag Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-[#121217]/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                  {item.tag}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="bg-[#FFD43B] text-[#121217] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#121217]">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="p-4 bg-white flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-display font-black text-base text-[#121217] group-hover:text-[#E91E63] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span className="flex items-center gap-1 text-[#8E44FF]">
                  <Eye className="w-3.5 h-3.5" /> Click to enlarge
                </span>
                <span className="text-stone-400">COLORIDO '26</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border-3 border-[#121217] fest-shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-stone-50 border-b-2 border-[#121217] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8E44FF] block">
                  {activePhoto.category} Arena · Photo {activeModalIdx + 1} of {filteredItems.length}
                </span>
                <h2 className="font-display font-black text-xl text-[#121217] leading-tight">
                  {activePhoto.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getOptimizedImageUrl(activePhoto.img)}
                  download
                  className="p-2 rounded-full border-2 border-[#121217] bg-white hover:bg-stone-100 transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4 text-[#121217]" />
                </a>
                <button
                  onClick={() => setActiveModalIdx(null)}
                  className="p-2 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-stone-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-[#121217]" />
                </button>
              </div>
            </div>

            {/* Large Image Frame */}
            <div className="relative flex-1 bg-stone-950 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh]">
              <img
                src={getOptimizedImageUrl(activePhoto.img, { width: 1600 })}
                onError={(e) => handleImageFallback(e, activePhoto.img)}
                alt={activePhoto.title}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next buttons */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#121217] border-2 border-[#121217] fest-shadow-sm transition-transform hover:scale-105"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#121217] border-2 border-[#121217] fest-shadow-sm transition-transform hover:scale-105"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Footer with Details */}
            <div className="p-4 bg-white border-t-2 border-[#121217] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="font-semibold text-stone-700">
                {activePhoto.description}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full font-black text-[10px] uppercase bg-purple-100 text-[#8E44FF] border border-purple-200">
                  {activePhoto.tag}
                </span>
                <span className="text-stone-400 font-bold">COLORIDO '26 Official Archives</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
