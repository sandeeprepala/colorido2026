import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Drama, Trophy, ArrowRight } from 'lucide-react';

export default function CategoryCard({ category, title, subtitle, icon, count, colorClass, link }) {
  const getIcon = () => {
    switch (category) {
      case 'technical':
        return <Lightbulb className="w-10 h-10 text-[#8E44FF]" strokeWidth={2.2} />;
      case 'cultural':
        return <Drama className="w-10 h-10 text-[#E91E63]" strokeWidth={2.2} />;
      case 'sports':
        return <Trophy className="w-10 h-10 text-[#16A34A]" strokeWidth={2.2} />;
      default:
        return <Lightbulb className="w-10 h-10 text-stone-800" />;
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
        };
      case 'cultural':
        return {
          bg: 'bg-[#FFE4E6]/90',
          border: 'border-[#E91E63]',
          shadow: 'fest-shadow-pink',
          badge: 'bg-[#E91E63] text-white',
          titleColor: 'text-[#BE123C]',
        };
      case 'sports':
        return {
          bg: 'bg-[#DCFCE7]/90',
          border: 'border-[#7ED957]',
          shadow: 'fest-shadow-green',
          badge: 'bg-[#16A34A] text-white',
          titleColor: 'text-[#15803D]',
        };
      default:
        return {
          bg: 'bg-stone-100',
          border: 'border-[#121217]',
          shadow: 'fest-shadow',
          badge: 'bg-[#121217] text-white',
          titleColor: 'text-[#121217]',
        };
    }
  };

  const style = getStyle();

  return (
    <Link
      to={link || `/events?category=${category}`}
      className={`group relative flex flex-col items-center text-center p-8 rounded-3xl border-2 ${style.border} ${style.bg} ${style.shadow} hover:-translate-y-2 hover:shadow-xl transition-all duration-200 overflow-hidden`}
    >
      {/* Decorative organic background blob */}
      <div className="w-20 h-20 rounded-full bg-white/90 border-2 border-[#121217] flex items-center justify-center mb-6 fest-shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-200">
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
        <span className="w-8 h-8 rounded-full bg-[#121217] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
