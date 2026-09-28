import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Calendar, MapPin, Trophy, MessageSquare,
  Store, Flame, ArrowUpRight, CheckCircle2, ShieldCheck, Heart
} from 'lucide-react';
import CountdownTimer from '../components/common/CountdownTimer';
import CategoryCard from '../components/common/CategoryCard';
import EventCard from '../components/common/EventCard';
import { eventsAPI, leaderboardAPI, discussionAPI } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [featuredCategory, setFeaturedCategory] = useState('all');
  const [liveLeaderboard, setLiveLeaderboard] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, lbRes, discRes] = await Promise.all([
          eventsAPI.getEvents(),
          leaderboardAPI.getAllLeaderboards(),
          discussionAPI.getDiscussion(),
        ]);
        setEvents(eventsRes.data.events || []);

        const live = (lbRes.data.leaderboards || []).find((b) => b.status === 'LIVE') || lbRes.data.leaderboards?.[0];
        setLiveLeaderboard(live);

        setRecentMessages((discRes.data.messages || []).slice(-3).reverse());
      } catch (err) {
        console.error('HomePage data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvents = featuredCategory === 'all'
    ? events.slice(0, 6)
    : events.filter((e) => e.category.toLowerCase() === featuredCategory).slice(0, 6);

  return (
    <div className="space-y-20 sm:space-y-28">

      {/* 1. HERO SECTION (Inspired by the COLORIDO '26 Poster) */}
      <section className="relative pt-6 sm:pt-12 pb-12 overflow-hidden">

        {/* Subtle decorative background noise */}
        <div className="absolute inset-0 bg-grain opacity-60 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Top Tagline Sticker & Category Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-[#121217] px-4 py-1.5 rounded-full fest-shadow-sm -rotate-1 hover:rotate-0 transition-transform">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E91E63] animate-ping"></span>
              <span className="font-hand text-lg sm:text-xl text-[#121217]">
                Where Creativity Meets Every Field.
              </span>
            </div>

            {/* Category Pills directly mirroring the poster */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black">
              <span className="bg-[#8E44FF]/10 text-[#8E44FF] border border-[#8E44FF]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8E44FF]"></span>
                TECHNICAL
              </span>
              <span className="bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7A00]"></span>
                CULTURAL
              </span>
              <span className="bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                SPORTS
              </span>
            </div>
          </div>

          {/* Main Hero Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Oversized Experimental Typography */}
            <div className="lg:col-span-7 space-y-6">

              <div className="relative select-none">

                {/* Hand-drawn decorative star */}
                <div className="absolute -top-6 -left-4 text-3xl font-black text-[#FF7A00] animate-spin" style={{ animationDuration: '12s' }}>
                  ✦
                </div>

                {/* Oversized Festival Name */}
                <h1 className="font-display font-black tracking-tight leading-[0.88] text-[68px] sm:text-[100px] md:text-[124px] lg:text-[132px] text-[#121217]">
                  <span className="block text-[#E91E63] hover:translate-x-1 transition-transform inline-block">CO</span>
                  <span className="text-[#FF7A00] hover:translate-x-1 transition-transform inline-block ml-1">LO</span>
                  <br />
                  <span className="text-[#19CFE8] hover:translate-x-1 transition-transform inline-block">RI</span>
                  <span className="text-[#8E44FF] hover:translate-x-1 transition-transform inline-block ml-1">DO</span>
                  <span className="inline-block ml-3 sm:ml-4 text-4xl sm:text-6xl md:text-7xl font-black bg-[#121217] text-white px-3 sm:px-5 py-1 sm:py-2 rounded-2xl -rotate-6 align-middle fest-shadow-pink">
                    '26
                  </span>
                </h1>
              </div>

              <p className="font-body text-base sm:text-lg text-stone-700 max-w-xl font-medium leading-relaxed">
                The largest inter-collegiate convergence of code warriors, powerhouse musicians, dynamic dancers, and varsity champions. Three electric days. Over 20 live experiences.
              </p>

              {/* Date & Location Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-2 bg-white border-2 border-[#121217] px-4 py-2 rounded-2xl fest-shadow-sm font-bold text-xs sm:text-sm text-[#121217]">
                  <Calendar className="w-4 h-4 text-[#FF7A00]" />
                  <span>OCTOBER 18 – 20, 2026</span>
                </div>
                <div className="flex items-center gap-2 bg-white border-2 border-[#121217] px-4 py-2 rounded-2xl fest-shadow-sm font-bold text-xs sm:text-sm text-[#121217]">
                  <MapPin className="w-4 h-4 text-[#E91E63]" />
                  <span>R.V.R &amp; J.C College of Engineering</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to={isAuthenticated ? '/events' : '/register'}
                  className="bg-[#121217] hover:bg-[#E91E63] text-white px-8 py-4 rounded-full font-black text-sm sm:text-base border-2 border-[#121217] fest-shadow-lg transition-all flex items-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 text-[#FFD43B] group-hover:rotate-12 transition-transform" />
                  <span>REGISTER NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/events"
                  className="bg-white hover:bg-stone-100 text-[#121217] px-7 py-4 rounded-full font-black text-sm sm:text-base border-2 border-[#121217] fest-shadow transition-all"
                >
                  EXPLORE EVENTS
                </Link>
              </div>

            </div>

            {/* Right Column: Festival Collage Poster Artwork */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">

                {/* Vintage Festival Poster Artwork Container */}
                <div className="relative rounded-3xl border-3 border-[#121217] bg-white p-3 fest-shadow-xl overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="/assets/hero_art.jpg"
                    alt="COLORIDO '26 Festival Artwork Collage"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  <div className="p-3 bg-white text-center">
                    <p className="font-hand text-xl font-bold text-stone-800">
                      "Where Creativity Meets Every Field"
                    </p>
                  </div>
                </div>

                {/* Floating Stamp Sticker */}
                <div className="absolute -bottom-5 -left-4 bg-[#FFD43B] border-2 border-[#121217] rounded-2xl p-3 fest-shadow-sm -rotate-6">
                  <p className="text-[11px] font-black uppercase text-[#121217] tracking-wider">
                    🏆 ₹2,50,000+
                  </p>
                  <p className="text-[9px] font-bold text-stone-800 uppercase">
                    Total Prize Pool
                  </p>
                </div>

                {/* Floating Stalls Stamp */}
                <div className="absolute -top-4 -right-4 bg-[#19CFE8] border-2 border-[#121217] rounded-2xl p-3 fest-shadow-sm rotate-6">
                  <p className="text-[11px] font-black uppercase text-[#121217] tracking-wider">
                    🎪 20 Live Stalls
                  </p>
                  <p className="text-[9px] font-bold text-stone-800 uppercase">
                    Food &amp; Carnivals
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. PROMINENT COUNTDOWN TIMER SECTION */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-xs border-2 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-2 left-6 text-xl text-[#FFD43B]">✦</div>
          <div className="absolute bottom-2 right-6 text-xl text-[#8E44FF]">✦</div>
          <CountdownTimer targetDate="2026-10-18T09:00:00" />
        </div>
      </section>

      {/* 3. EXPLORE THE EXPERIENCES (Technical, Cultural, Sports Cloud Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#E91E63] block mb-2">
            THREE VIBRANT ARENAS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#121217] tracking-tight">
            EXPLORE THE EXPERIENCES
          </h2>
          <p className="font-semibold text-stone-600 text-sm sm:text-base mt-2">
            Immerse yourself in competitive coding duels, electrifying musical nights, or high-octane sports championships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <CategoryCard
            category="technical"
            title="Technical"
            subtitle="Hackathons, Web Blitz sprints, Obstacle Robo racing, AI Innovation showcase, and CTF cyber battles."
            count="6"
            link="/events?category=technical"
          />

          <CategoryCard
            category="cultural"
            title="Cultural"
            subtitle="Street dance battles, Battle of the Bands rock night, Fashion runways, One-act stage dramas, and solo acoustics."
            count="5"
            link="/events?category=cultural"
          />

          <CategoryCard
            category="sports"
            title="Sports"
            subtitle="Box cricket league, 5v5 Futsal Thunder, 3v3 FIBA basketball, Badminton open, and sand volleyball clash."
            count="5"
            link="/events?category=sports"
          />
        </div>

      </section>

      {/* 4. FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF7A00] block mb-1">
              COMPETITION SPOTLIGHT
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#121217]">
              FEATURED EVENTS
            </h2>
          </div>

          {/* Filter Pills */}
<<<<<<< HEAD
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-[#121217] fest-shadow-sm text-xs font-bold">
            {['all', 'technical', 'cultural', 'sports'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFeaturedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${featuredCategory === cat
                    ? 'bg-[#121217] text-white'
                    : 'text-stone-700 hover:text-black'
                  }`}
              >
                {cat}
              </button>
            ))}
=======
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-[#121217] fest-shadow-sm text-xs font-bold relative">
            {['all', 'technical', 'cultural', 'sports'].map((cat) => {
              const isSelected = featuredCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFeaturedCategory(cat)}
                  className="relative isolate px-3.5 py-1.5 rounded-xl capitalize transition-colors cursor-pointer select-none"
                >
                  {isSelected && (
                    <motion.span
                      layoutId="home-featured-capsule"
                      className="absolute inset-0 bg-[#121217] rounded-xl z-0 shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-stone-700 hover:text-black'}`}>
                    {cat}
                  </span>
                </button>
              );
            })}
>>>>>>> e6e81c52e9fe924d8f901133bc6ec437ea4f9492
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 font-display font-black text-sm text-[#121217] hover:text-[#E91E63] group"
          >
            <span>VIEW ALL 16 FESTIVAL EVENTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </section>

      {/* 5. FESTIVAL STALLS TEASER & INTERACTIVE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFDF9] border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-lg relative overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-black uppercase bg-[#FF7A00] text-white px-3 py-1 rounded-full inline-block">
                STUDENT CARNIVAL STALLS
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#121217] tracking-tight">
                Set Up Your Own Experience At The Festival.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Got culinary magic or an addictive carnival game? Book an official festival stall lot! Explore the graphical floor-plan, pick an available booth (F01–F10 or G01–G10), and start serving thousands of festival visitors.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/stalls"
                  className="bg-[#121217] hover:bg-[#FF7A00] text-white px-7 py-3 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  EXPLORE STALL MAP &amp; APPLY
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border-2 border-[#121217] rounded-2xl p-5 fest-shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold border-b pb-2">
                <span className="text-[#FF7A00]">🍔 10 Food Lots</span>
                <span className="text-[#8E44FF]">🎯 10 Game Lots</span>
                <span className="text-emerald-700">🟢 12 Lots Available</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-black">
                {['F01', 'F02', 'F03', 'F04', 'F05'].map((id) => (
                  <div key={id} className="p-2 rounded-lg border border-stone-300 bg-stone-50">
                    {id}
                  </div>
                ))}
                {['G01', 'G02', 'G03', 'G04', 'G05'].map((id) => (
                  <div key={id} className="p-2 rounded-lg border border-stone-300 bg-stone-50">
                    {id}
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-semibold text-stone-500 text-center pt-1">
                Visual floor-plan includes Food Street East, Food Street West, and Central Carnival Lawn.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. LIVE SPORTS LEADERBOARD & DISCUSSION TEASER GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Live Sports Ticker */}
          <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <h3 className="font-display font-black text-xl text-[#121217]">
                  LIVE SPORTS LEADERBOARD
                </h3>
              </div>
              <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300 uppercase">
                {liveLeaderboard?.sport_name || 'Cricket League'}
              </span>
            </div>

            <p className="text-xs font-bold text-stone-500 mb-4">
              Match Info: {liveLeaderboard?.match_info || 'Live Super 4 Tournament In Progress'}
            </p>

            <div className="space-y-2.5 flex-1">
              {(liveLeaderboard?.entries || []).slice(0, 4).map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl border-2 border-stone-200 bg-stone-50 font-bold text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#121217] text-white flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <span className="text-[#121217]">{entry.team_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-600">{entry.score}</span>
                    <span className="bg-[#FFD43B] text-black px-2 py-0.5 rounded text-xs font-black">
                      {entry.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-stone-200">
              <Link
                to="/leaderboard"
                className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1"
              >
                View Full Sports Tournament Leaderboards →
              </Link>
            </div>
          </div>

          {/* Student Discussion Chatter */}
          <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#8E44FF]" />
                <h3 className="font-display font-black text-xl text-[#121217]">
                  FESTIVAL COMMUNITY CHAT
                </h3>
              </div>
              <span className="text-xs font-black bg-purple-100 text-[#8E44FF] px-2.5 py-0.5 rounded-full border border-purple-300">
                Live Chatter
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#121217]">{msg.user_name}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-stone-700 font-medium leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-stone-200">
              <Link
                to="/discussion"
                className="text-xs font-black text-[#8E44FF] hover:underline flex items-center gap-1"
              >
                Join Campus Discussion &amp; Connect →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6.5 FESTIVAL SNAPSHOTS & PHOTO GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E91E63] block mb-1">
              CAMPUS ARCHIVES &amp; REAL PHOTOS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#121217]">
              FESTIVAL MOMENTS
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-xs font-black text-[#121217] hover:text-[#E91E63] flex items-center gap-1 group"
          >
            <span>Explore Full Photo Gallery →</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Rujangna Kickoff', tag: 'Cultural Nights', img: '/gallery/rujangna-2025.jpeg' },
            { title: 'Concert & Arena Euphoria', tag: 'Live Concert', img: '/gallery/6.jpg' },
            { title: 'Band Battle Spotlight', tag: 'Live Music', img: '/gallery/22.jpg' },
            { title: 'Street Dance Cypher', tag: 'Choreography', img: '/gallery/23.jpg' },
          ].map((item, i) => (
            <Link
              key={i}
              to="/gallery"
              className="group relative rounded-2xl border-2 border-[#121217] bg-white fest-shadow overflow-hidden hover:-translate-y-1 transition-all"
            >
              <div className="h-44 sm:h-52 overflow-hidden bg-stone-100">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 bg-white border-t border-stone-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8E44FF] block">
                  {item.tag}
                </span>
                <p className="font-display font-black text-xs text-[#121217] truncate">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. BE A PART OF COLORIDO '26 — TORN PAPER BANNER (Mirroring Poster) */}
      <section className="relative px-4 sm:px-6 lg:px-8">

        {/* Torn paper top edge */}
        <div className="h-4 bg-[#FFD43B] torn-paper-top max-w-7xl mx-auto"></div>

        {/* Yellow Banner Body */}
        <div className="bg-[#FFD43B] max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-16 border-x-3 border-[#121217] relative overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left side: Call to Action & Hand-drawn arrow */}
            <div className="lg:col-span-7 space-y-6">

              <span className="font-hand text-3xl sm:text-4xl text-stone-900 block -rotate-2">
                Get your official festival passes today!
              </span>

              <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#121217] tracking-tight leading-[0.95]">
                BE A PART OF<br />
                COLORIDO '26
              </h2>

              <div className="flex items-center gap-6 pt-2">
                <Link
                  to={isAuthenticated ? '/events' : '/register'}
                  className="bg-[#121217] hover:bg-[#E91E63] text-white px-8 py-4 rounded-full font-black text-base border-2 border-[#121217] fest-shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                {/* Hand-drawn arrow indication matching poster */}
                <div className="hidden sm:flex items-center gap-2 font-hand text-2xl font-bold text-stone-900 -rotate-6">
                  <span>← Show this entry pass at venue</span>
                </div>
              </div>

            </div>

            {/* Right side: Celebration crowd collage cutout from poster */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl border-3 border-[#121217] bg-white p-2 fest-shadow-xl overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-300">
                <img
                  src="/assets/crowd_art.jpg"
                  alt="Students Celebrating at COLORIDO '26"
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Torn paper bottom edge */}
        <div className="h-4 bg-[#FFD43B] torn-paper-bottom max-w-7xl mx-auto"></div>

      </section>

    </div>
  );
}
