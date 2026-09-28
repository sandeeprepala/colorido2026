import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Mail, Phone, Heart, Award, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FAF8F5] border-t-2 border-[#121217] pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Decorative colored top line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-[#E91E63]"></div>
        <div className="flex-1 bg-[#FF7A00]"></div>
        <div className="flex-1 bg-[#FFD43B]"></div>
        <div className="flex-1 bg-[#19CFE8]"></div>
        <div className="flex-1 bg-[#7ED957]"></div>
        <div className="flex-1 bg-[#8E44FF]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-3xl tracking-tight">
                <span className="text-[#E91E63]">C</span>
                <span className="text-[#FF7A00]">O</span>
                <span className="text-[#19CFE8]">L</span>
                <span className="text-[#FFD43B]">O</span>
                <span className="text-[#8E44FF]">R</span>
                <span className="text-[#19CFE8]">I</span>
                <span className="text-[#7ED957]">D</span>
                <span className="text-[#E91E63]">O</span>
              </span>
              <span className="text-xl font-black bg-[#121217] text-white px-2 py-0.5 rounded-md -rotate-3">
                '26
              </span>
            </div>
            <p className="font-hand text-2xl text-stone-700 max-w-sm">
              "Where Creativity Meets Every Field."
            </p>
            <p className="text-sm text-stone-600 leading-relaxed max-w-md">
              The premier inter-college mega festival combining high-stakes TECHNICAL hackathons, electrifying CULTURAL stages, and thrilling outdoor SPORTS tournaments.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-stone-300">
                <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                October 18 – 20, 2026
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-stone-300">
                <MapPin className="w-3.5 h-3.5 text-[#E91E63]" />
                Apex Campus
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-black text-base uppercase tracking-wider text-[#121217] mb-4 flex items-center gap-1.5">
              <span>Festival</span>
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-stone-700">
              <li><Link to="/events" className="hover:text-[#E91E63] transition-colors">All Events</Link></li>
              <li><Link to="/events?category=technical" className="hover:text-[#8E44FF] transition-colors">Technical Events</Link></li>
              <li><Link to="/events?category=cultural" className="hover:text-[#E91E63] transition-colors">Cultural Nights</Link></li>
              <li><Link to="/events?category=sports" className="hover:text-[#7ED957] transition-colors">Sports Arenas</Link></li>
              <li><Link to="/schedule" className="hover:text-[#FF7A00] transition-colors">Festival Timeline</Link></li>
            </ul>
          </div>

          {/* Campus Experiences */}
          <div>
            <h4 className="font-display font-black text-base uppercase tracking-wider text-[#121217] mb-4">
              Experiences
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-stone-700">
              <li><Link to="/stalls" className="hover:text-[#FF7A00] transition-colors">Food &amp; Game Stalls</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#19CFE8] transition-colors">Live Sports Leaderboard</Link></li>
              <li><Link to="/discussion" className="hover:text-[#8E44FF] transition-colors">Student Community Chat</Link></li>
              <li><Link to="/gallery" className="hover:text-[#E91E63] transition-colors">Photo &amp; Video Gallery</Link></li>
              <li><Link to="/about" className="hover:text-[#121217] transition-colors">Rules &amp; Guidelines</Link></li>
            </ul>
          </div>

          {/* Verification & Help */}
          <div>
            <h4 className="font-display font-black text-base uppercase tracking-wider text-[#121217] mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-stone-700">
              <li><Link to="/my-festival" className="hover:text-[#19CFE8] transition-colors">My Registrations &amp; QR</Link></li>
              <li><Link to="/profile" className="hover:text-[#121217] transition-colors">Student Profile</Link></li>
              <li><Link to="/admin" className="text-[#8E44FF] hover:underline flex items-center gap-1 font-bold">Admin Portal <ArrowUpRight className="w-3.5 h-3.5" /></Link></li>
              <li>
                <div className="pt-2 text-xs text-stone-500">
                  <p className="font-semibold text-stone-700">Helpline:</p>
                  <p>fest@colorido.college.edu</p>
                  <p>+91 (0) 98765-43210</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-300 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-stone-600">
          <p>© 2026 COLORIDO FESTIVAL COMMITTEE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-black cursor-pointer">Code of Conduct</span>
            <span className="hover:text-black cursor-pointer">Safety Guidelines</span>
            <span className="hover:text-black cursor-pointer">Campus Map</span>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-[#E91E63] fill-current" /> for college creators &amp; athletes
          </p>
        </div>
      </div>
    </footer>
  );
}
