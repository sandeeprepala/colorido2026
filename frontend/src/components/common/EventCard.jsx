import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Users, ArrowUpRight } from 'lucide-react';

export default function EventCard({ event, onRegisterClick }) {
  const getCategoryTheme = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'technical':
        return {
          badge: 'bg-[#8E44FF] text-white',
          border: 'border-[#8E44FF]',
          accent: 'text-[#8E44FF]',
          tag: 'Technical',
        };
      case 'cultural':
        return {
          badge: 'bg-[#E91E63] text-white',
          border: 'border-[#E91E63]',
          accent: 'text-[#E91E63]',
          tag: 'Cultural',
        };
      case 'sports':
        return {
          badge: 'bg-[#16A34A] text-white',
          border: 'border-[#7ED957]',
          accent: 'text-[#16A34A]',
          tag: 'Sports',
        };
      default:
        return {
          badge: 'bg-[#121217] text-white',
          border: 'border-[#121217]',
          accent: 'text-[#121217]',
          tag: 'Event',
        };
    }
  };

  const theme = getCategoryTheme(event.category);

  return (
    <div className="group bg-white rounded-3xl border-2 border-[#121217] fest-shadow flex flex-col overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200">
      
      {/* Banner / Poster Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 border-b-2 border-[#121217]">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#121217] fest-shadow-sm ${theme.badge}`}>
            {theme.tag}
          </span>
        </div>

        {/* Prize Pool Tag */}
        {event.prize_pool && (
          <div className="absolute top-3.5 right-3.5">
            <span className="bg-[#FFD43B] text-[#121217] font-black text-xs px-2.5 py-1 rounded-full border border-[#121217] fest-shadow-sm flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#121217]" />
              {event.prize_pool}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <Link to={`/events/${event.id}`}>
          <h3 className="font-display font-black text-xl text-[#121217] group-hover:text-[#E91E63] transition-colors line-clamp-1 mb-2">
            {event.name}
          </h3>
        </Link>

        <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">
          {event.description}
        </p>

        {/* Prize Money Breakdown 1st, 2nd, 3rd */}
        {(event.prize_1st || event.prize_2nd || event.prize_3rd) && (
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-2.5 mb-3">
            <div className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-1 flex items-center justify-between">
              <span>Prize Money Breakdown</span>
              {event.prize_pool && <span className="text-[#FF7A00] font-black">{event.prize_pool}</span>}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-amber-100/80 border border-amber-300 rounded-xl py-1 px-1">
                <span className="block text-[10px] font-black text-amber-900 leading-none mb-0.5">🥇 1st</span>
                <span className="block text-xs font-black text-amber-950 truncate">{event.prize_1st || '-'}</span>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded-xl py-1 px-1">
                <span className="block text-[10px] font-black text-slate-700 leading-none mb-0.5">🥈 2nd</span>
                <span className="block text-xs font-black text-slate-900 truncate">{event.prize_2nd || '-'}</span>
              </div>
              <div className="bg-orange-100/70 border border-orange-300 rounded-xl py-1 px-1">
                <span className="block text-[10px] font-black text-orange-900 leading-none mb-0.5">🥉 3rd</span>
                <span className="block text-xs font-black text-orange-950 truncate">{event.prize_3rd || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Event Key Info Grid */}
        <div className="space-y-1.5 text-xs font-semibold text-stone-700 mb-6 mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
            <span className="truncate">{event.event_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#8E44FF] shrink-0" />
            <span className="truncate">{event.start_time} - {event.end_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#E91E63] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
            <span className="font-bold text-stone-800">
              {Number(event.max_team_size) === 1
                ? '👤 Solo (1 Participant)'
                : `👥 Team: ${event.min_team_size || 1} - ${event.max_team_size || 4} Members`}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
          <Link
            to={`/events/${event.id}`}
            className="text-xs font-black text-stone-700 hover:text-black flex items-center gap-1 group/link"
          >
            Details <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>

          {event.is_registered ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-300">
              REGISTERED ✓
            </span>
          ) : event.is_full ? (
            <span className="bg-stone-200 text-stone-600 text-xs font-black px-3 py-1.5 rounded-full">
              HOUSEFULL
            </span>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="bg-[#121217] hover:bg-[#E91E63] text-white text-xs font-black px-4 py-2 rounded-full border border-[#121217] fest-shadow-sm transition-all"
            >
              Register Now
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
