import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Drama, Trophy, ArrowRight } from 'lucide-react';

export default function CategoryCard({ category, title, subtitle, icon, count, colorClass, link }) {
  const getIcon = (isLarge = false) => {
    const sizeClass = isLarge ? 'w-12 h-12' : 'w-10 h-10';
    switch (category) {
      case 'technical':
        return <Lightbulb className={`${sizeClass} text-[#8E44FF]`} strokeWidth={2.2} />;
      case 'cultural':
        return <Drama className={`${sizeClass} text-[#E91E63]`} strokeWidth={2.2} />;
      case 'sports':
        return <Trophy className={`${sizeClass} text-[#16A34A]`} strokeWidth={2.2} />;
      default:
        return <Lightbulb className={`${sizeClass} text-stone-800`} />;
    }
  };

  const getStyle = () => {
    switch (category) {
      case 'technical':
        return {
          bg: 'bg-[#EDE9FE]/90',
          border: 'border-[#8E44FF]',
          shadow: 'fest-shadow-purple',
          badge: 'bg-[#8E44FF] text-white',
          titleColor: 'text-[#6B21A8]',
          backBg: 'bg-[#FAF6FF]',
          backBorder: 'border-[#8E44FF]',
          backShadow: 'fest-shadow-purple',
          accentBadge: 'bg-purple-100 text-[#8E44FF] border border-purple-200',
          itemBg: 'bg-white border-2 border-[#8E44FF]/25 text-stone-800 shadow-xs',
          tagline: 'Code & Innovation',
          highlights: ['Web Blitz Hackathons', 'AI Showcase & Robo Races', '₹75,000+ Total Prize Pool'],
          buttonBg: 'bg-[#8E44FF] hover:bg-[#7b35e2] text-white',
        };
      case 'cultural':
        return {
          bg: 'bg-[#FFE4E6]/90',
          border: 'border-[#E91E63]',
          shadow: 'fest-shadow-pink',
          badge: 'bg-[#E91E63] text-white',
          titleColor: 'text-[#BE123C]',
          backBg: 'bg-[#FFF5F7]',
          backBorder: 'border-[#E91E63]',
          backShadow: 'fest-shadow-pink',
          accentBadge: 'bg-pink-100 text-[#E91E63] border border-pink-200',
          itemBg: 'bg-white border-2 border-[#E91E63]/25 text-stone-800 shadow-xs',
          tagline: 'Stage & Expression',
          highlights: ['Battle of the Bands', 'Street Dance & Runways', '₹1,00,000+ Total Prize Pool'],
          buttonBg: 'bg-[#E91E63] hover:bg-[#d81557] text-white',
        };
      case 'sports':
        return {
          bg: 'bg-[#DCFCE7]/90',
          border: 'border-[#7ED957]',
          shadow: 'fest-shadow-green',
          badge: 'bg-[#16A34A] text-white',
          titleColor: 'text-[#15803D]',
          backBg: 'bg-[#F2FBF5]',
          backBorder: 'border-[#16A34A]',
          backShadow: 'fest-shadow-green',
          accentBadge: 'bg-emerald-100 text-[#15803D] border border-emerald-200',
          itemBg: 'bg-white border-2 border-[#16A34A]/25 text-stone-800 shadow-xs',
          tagline: 'Glory & Athletics',
          highlights: ['Box Cricket & 5v5 Futsal', '3v3 Basketball & Volleyball', '₹75,000+ Total Prize Pool'],
          buttonBg: 'bg-[#16A34A] hover:bg-[#13823c] text-white',
        };
      default:
        return {
          bg: 'bg-stone-100',
          border: 'border-[#121217]',
          shadow: 'fest-shadow',
          badge: 'bg-[#121217] text-white',
          titleColor: 'text-[#121217]',
          backBg: 'bg-white',
          backBorder: 'border-[#121217]',
          backShadow: 'fest-shadow',
          accentBadge: 'bg-stone-100 text-stone-700 border border-stone-300',
          itemBg: 'bg-white border border-stone-200 text-stone-800',
          tagline: 'Festival Arena',
          highlights: ['Multiple Competitions', 'Cash Prizes & Certificates'],
          buttonBg: 'bg-[#121217] text-white',
        };
    }
  };

  const style = getStyle();

  return (
    <div className="card-flip-container relative w-full h-[410px]">
      <Link
        to={link || `/events?category=${category}`}
        className="relative w-full h-full block cursor-pointer select-none"
      >
        <div className="card-flip-inner relative w-full h-full">
          
          {/* FRONT FACE (Light Theme) */}
          <div
            className={`card-face-front absolute inset-0 w-full h-full rounded-3xl border-2 ${style.border} ${style.bg} ${style.shadow} p-7 sm:p-8 flex flex-col items-center text-center overflow-hidden`}
          >
            {/* Subtle flip hint badge */}
            <span className="absolute top-3.5 right-3.5 text-[10px] font-black uppercase tracking-wider text-stone-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-stone-200 shadow-xs pointer-events-none">
              Flip ↷
            </span>

            {/* Icon Circle */}
            <div className="w-20 h-20 rounded-full bg-white/95 border-2 border-[#121217] flex items-center justify-center mb-6 fest-shadow-sm">
              {getIcon()}
            </div>

            <h3 className={`font-display font-black text-2xl sm:text-3xl ${style.titleColor} mb-2 tracking-tight`}>
              {title}
            </h3>

            <p className="text-sm font-semibold text-stone-600 mb-6 max-w-xs leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-auto flex items-center gap-2">
              <span className={`text-xs font-black px-3 py-1 rounded-full ${style.badge} uppercase tracking-wider`}>
                {count || '5+'} Events
              </span>
              <span className="w-8 h-8 rounded-full bg-[#121217] text-white flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* BACK FACE (Light Theme - Glitch Free) */}
          <div
            className={`card-face-back absolute inset-0 w-full h-full rounded-3xl border-2 ${style.backBorder} ${style.backBg} ${style.backShadow} p-7 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden`}
          >
            {/* Top Tagline */}
            <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block ${style.accentBadge}`}>
                ✦ {style.tagline} ✦
              </span>
              <h4 className="font-display font-black text-2xl sm:text-3xl text-[#121217] tracking-tight">
                {title} Arena
              </h4>
            </div>

            {/* Highlights List */}
            <div className="space-y-2.5 my-auto w-full max-w-xs">
              {style.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl py-2 px-3 text-xs font-bold ${style.itemBg} flex items-center justify-center gap-1.5`}
                >
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Bottom Action Pill */}
            <div className="w-full pt-1">
              <span
                className={`w-full py-2.5 px-4 rounded-full font-black text-xs sm:text-sm border-2 border-[#121217] fest-shadow-sm flex items-center justify-center gap-2 ${style.buttonBg} transition-all`}
              >
                <span>EXPLORE ALL {count} EVENTS</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
