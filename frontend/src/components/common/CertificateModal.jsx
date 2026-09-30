import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Award, Download, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import APP_CONFIG from '../../config';

export default function CertificateModal({ certificate, onClose }) {
  const certRef = useRef(null);

  if (!certificate) return null;

  const verifyUrl = APP_CONFIG.getCertificateVerifyUrl(certificate.certificate_id);

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.certificate_id}_${certificate.participant_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border-3 border-[#121217] fest-shadow-xl p-4 sm:p-8 my-8">

        {/* Top Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-[#8E44FF]">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-black text-lg text-[#121217]">
                Authentic Festival Certificate
              </h3>
              <p className="text-xs font-semibold text-stone-500">
                Verified ID: {certificate.certificate_id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-[#121217] hover:bg-[#8E44FF] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all fest-shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5 text-[#121217]" />
            </button>
          </div>
        </div>

        {/* Printable / Rendered Certificate Container */}
        <div
          ref={certRef}
          className="relative bg-[#FFFDF9] border-4 border-[#121217] rounded-2xl p-8 sm:p-12 text-center overflow-hidden shadow-inner"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#E91E63]"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#FF7A00]"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#19CFE8]"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#7ED957]"></div>

          {/* Festival Brand Header */}
          <div className="mb-6">
            <span className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              <span className="text-[#E91E63]">C</span>
              <span className="text-[#FF7A00]">O</span>
              <span className="text-[#19CFE8]">L</span>
              <span className="text-[#FFD43B]">O</span>
              <span className="text-[#8E44FF]">R</span>
              <span className="text-[#19CFE8]">I</span>
              <span className="text-[#7ED957]">D</span>
              <span className="text-[#E91E63]">O</span>
              <span className="text-xl font-black bg-[#121217] text-white px-2 py-0.5 rounded ml-2">
                '26
              </span>
            </span>
            <p className="text-xs font-black tracking-widest uppercase text-stone-500 mt-1">
              ANNUAL INTER-COLLEGE CULTURAL, TECHNICAL &amp; SPORTS FESTIVAL
            </p>
          </div>

          {/* Title */}
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121217] uppercase tracking-wide mb-2">
            Certificate of Recognition
          </h2>
          <p className="text-xs font-semibold text-stone-500 mb-6 uppercase tracking-wider">
            THIS IS PROUDLY PRESENTED TO
          </p>

          {/* Recipient Name */}
          <div className="py-2 mb-6 border-b-2 border-dashed border-stone-300 max-w-lg mx-auto">
            <span className="font-display font-black text-3xl sm:text-4xl text-[#8E44FF] underline decoration-[#FFD43B] decoration-4 underline-offset-8">
              {certificate.participant_name}
            </span>
          </div>

          {/* Achievement Description */}
          <p className="text-stone-700 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            for meritorious participation and enthusiastic spirit in <strong>{certificate.event_name}</strong> during the COLORIDO '26 College Festival, held at Apex Institute Campus.
          </p>

          {/* Certificate Footer: Signatures, ID, and Verification QR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-6 border-t border-stone-200">

            {/* Signature 1 */}
            <div className="text-left space-y-1">
              <p className="font-hand text-2xl text-stone-800 -rotate-3">
                {certificate.organizer_signature || 'Dr. Anita Roy'}
              </p>
              <div className="h-0.5 bg-stone-300 w-32"></div>
              <p className="text-[11px] font-bold text-stone-500 uppercase">
                Festival Convener
              </p>
            </div>

            {/* QR Verification Badge */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-2 bg-white border border-[#121217] rounded-lg shadow-xs">
                <QRCodeSVG value={verifyUrl} size={70} level="M" />
              </div>
              <span className="font-mono text-[10px] font-bold text-stone-600 mt-1">
                {certificate.certificate_id}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase">
                ✓ Verified Authentic
              </span>
            </div>

            {/* Signature 2 / Date */}
            <div className="text-right space-y-1">
              <p className="font-bold text-sm text-stone-900">
                {certificate.issued_date || 'October 18, 2026'}
              </p>
              <div className="h-0.5 bg-stone-300 w-32 ml-auto"></div>
              <p className="text-[11px] font-bold text-stone-500 uppercase">
                Date of Issue
              </p>
            </div>

          </div>

        </div>

        {/* Public Link Footer */}
        <div className="mt-4 text-center">
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#8E44FF] hover:underline"
          >
            Public Registry Verification Link: {verifyUrl}
          </a>
        </div>

      </div>
    </div>
  );
}
