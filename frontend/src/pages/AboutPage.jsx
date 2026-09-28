import React from 'react';
import { Sparkles, MapPin, Calendar, Users, Award, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#E91E63] bg-pink-100 px-3 py-1 rounded-full inline-block border border-pink-200">
          ABOUT THE FESTIVAL
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-[#121217] tracking-tight">
          COLORIDO '26
        </h1>
        <p className="font-hand text-2xl sm:text-3xl text-stone-700">
          "Where Creativity Meets Every Field."
        </p>
      </div>

      {/* Story Card */}
      <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-lg space-y-6">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121217]">
          The Convergence of Art, Logic &amp; Athletics
        </h2>
        <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
          COLORIDO '26 is the signature annual inter-collegiate festival of Apex Institute of Technology, uniting over 40 colleges across the nation. Designed to break conventional silos, COLORIDO stands for vibrant self-expression — marrying high-stakes algorithm hacking with electric musical stages and intense varsity turf battles.
        </p>
        <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
          Over 3 days, campus transforms into an open carnival featuring 20 student-operated food and game stalls, 16 marquee competitions, live sports broadcasting, and nightly headlining concerts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
          <div className="p-4 rounded-2xl bg-[#EDE9FE] border border-[#8E44FF] text-center">
            <span className="font-display font-black text-3xl text-[#8E44FF]">16</span>
            <p className="text-xs font-bold text-stone-700 uppercase mt-1">Marquee Events</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFE4E6] border border-[#E91E63] text-center">
            <span className="font-display font-black text-3xl text-[#E91E63]">₹2,50,000+</span>
            <p className="text-xs font-bold text-stone-700 uppercase mt-1">Cash Prizes</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#16A34A] text-center">
            <span className="font-display font-black text-3xl text-[#16A34A]">20</span>
            <p className="text-xs font-bold text-stone-700 uppercase mt-1">Carnival &amp; Food Stalls</p>
          </div>
        </div>
      </div>

      {/* Committee & Helpline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow space-y-3">
          <h3 className="font-display font-black text-xl text-[#121217]">
            Festival Organizing Committee
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Convened by Student Council &amp; Faculty Advisory Board. 
            Patron: Dr. Anita Roy (Dean Student Welfare). Student Leads: Sandeep Sharma, Priya Patel, Rahul Verma.
          </p>
          <div className="pt-2 text-xs font-bold text-stone-700 space-y-1">
            <p>Email: fest@colorido.college.edu</p>
            <p>Hotline: +91 98765 43210 / +91 91234 56789</p>
          </div>
        </div>

        <div className="bg-white border-2 border-[#121217] rounded-3xl p-6 fest-shadow space-y-3">
          <h3 className="font-display font-black text-xl text-[#121217]">
            Campus Coordinates &amp; Access
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Main Campus Gates open daily at 07:30 AM. Mandatory registration QR check-in at Gate 1 and Central Auditorium Plaza.
          </p>
          <div className="pt-2 text-xs font-bold text-stone-700 space-y-1">
            <p>Venue: Apex Institute of Technology, Innovation Quad</p>
            <p>Nearest Metro: College Campus Station (Line 3)</p>
          </div>
        </div>
      </div>

    </div>
  );
}
