import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, Calendar, MapPin, ExternalLink, ShieldCheck, Download } from 'lucide-react';

export default function QRModal({ registration, event, onClose }) {
  if (!registration) return null;

  const verifyUrl = `${window.location.origin}/registration/verify/${registration.qr_token}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-8 fest-shadow-xl overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-stone-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#121217]" />
        </button>

        {/* Top Fest Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED FESTIVAL PASS</span>
          </div>

          <h3 className="font-display font-black text-2xl text-[#121217]">
            {registration.event_name || event?.name}
          </h3>
          <p className="text-xs font-semibold text-stone-500 mt-1">
            COLORIDO '26 College Festival Entry
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-[#FAF8F5] border-2 border-dashed border-[#121217] rounded-2xl mb-6">
          <div className="p-3 bg-white border-2 border-[#121217] rounded-xl fest-shadow-sm">
            <QRCodeSVG
              value={verifyUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#121217"
            />
          </div>
          <p className="text-[11px] font-bold text-stone-500 text-center mt-3">
            Show this QR code at the event entrance for instant verification.
          </p>
        </div>

        {/* Ticket Details */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-semibold space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Participant:</span>
            <span className="font-bold text-[#121217]">{registration.student_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Registration ID:</span>
            <span className="font-mono font-bold bg-[#FFD43B] text-black px-2 py-0.5 rounded">
              {registration.registration_id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Date:</span>
            <span className="text-stone-800">{registration.event_date || event?.event_date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Venue:</span>
            <span className="text-stone-800 text-right truncate max-w-[200px]">{registration.venue || event?.venue}</span>
          </div>
        </div>

        {/* Action Link to Public Verification Page */}
        <div className="flex items-center justify-center">
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black text-[#8E44FF] hover:underline flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Open Public Verification Page <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
