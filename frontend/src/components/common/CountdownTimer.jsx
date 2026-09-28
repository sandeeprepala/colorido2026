import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export default function CountdownTimer({ targetDate = '2026-10-18T09:00:00' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 43,
    seconds: 21,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0'), color: 'text-[#121217]' },
    { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0'), color: 'text-[#121217]' },
    { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0'), color: 'text-[#121217]' },
    { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0'), color: 'text-[#E91E63]' },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Header Badge */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-widest text-[#E91E63] uppercase mb-3">
        <Flame className="w-4 h-4 fill-current text-[#E91E63] animate-bounce" />
        <span>FEST BEGINS IN</span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {timeBlocks.map((block) => (
          <div
            key={block.label}
            className="flex flex-col items-center justify-center bg-white border-2 border-[#121217] rounded-2xl sm:rounded-3xl p-3 sm:p-5 min-w-[72px] sm:min-w-[105px] md:min-w-[130px] fest-shadow hover:-translate-y-1 transition-transform"
          >
            <span className={`font-display font-black text-3xl sm:text-5xl md:text-6xl ${block.color} tracking-tight`}>
              {block.value}
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-stone-500 mt-1 uppercase">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
