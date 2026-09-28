import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ShieldCheck, ArrowLeft, Calendar } from 'lucide-react';
import { certificatesAPI } from '../services/api';

export default function VerifyCertificatePage() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await certificatesAPI.verifyCertificate(certificateId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Certificate not found in festival registry.');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [certificateId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-xl space-y-6 text-center">
        
        {/* Header */}
        <div>
          <span className="font-display font-black text-2xl tracking-tight text-[#121217]">
            <span className="text-[#E91E63]">C</span>
            <span className="text-[#FF7A00]">O</span>
            <span className="text-[#19CFE8]">L</span>
            <span className="text-[#FFD43B]">O</span>
            <span className="text-[#8E44FF]">R</span>
            <span className="text-[#19CFE8]">I</span>
            <span className="text-[#7ED957]">D</span>
            <span className="text-[#E91E63]">O</span>
            <span className="text-base bg-[#121217] text-white px-2 py-0.5 rounded ml-1">'26</span>
          </span>
          <p className="text-xs font-black tracking-widest text-stone-500 uppercase mt-1">
            Official Credential Verification Registry
          </p>
        </div>

        {loading ? (
          <div className="py-12">
            <div className="w-10 h-10 border-4 border-[#121217] border-t-[#8E44FF] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-xs text-stone-500">Querying certificate registry...</p>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300 fest-shadow-sm">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="font-display font-black text-2xl text-rose-700">
              UNVERIFIED CREDENTIAL
            </h2>
            <p className="text-xs font-semibold text-stone-600 max-w-xs mx-auto">
              {error}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 text-xs font-black uppercase fest-shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ AUTHENTIC CERTIFICATE</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Awarded To</span>
              <h2 className="font-display font-black text-3xl text-[#8E44FF]">
                {data.participant_name}
              </h2>
            </div>

            <div className="bg-[#FAF8F5] border-2 border-[#121217] rounded-2xl p-5 text-left text-xs font-semibold space-y-2.5">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Event:</span>
                <span className="font-bold text-sm text-[#121217]">{data.event_name}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Certificate ID:</span>
                <span className="font-mono font-black text-xs bg-[#19CFE8]/20 text-[#121217] px-2 py-0.5 rounded border border-[#121217]">
                  {data.certificate_id}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Recognition:</span>
                <span className="text-stone-800 text-right truncate max-w-[220px]">{data.achievement}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Issued Date:</span>
                <span className="text-stone-800">{data.issued_date}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Authorized By:</span>
                <span className="text-stone-800 text-right">{data.organizer_signature}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed by Festival Organizing Committee</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-stone-200">
          <Link
            to="/"
            className="text-xs font-bold text-stone-600 hover:text-black flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to COLORIDO '26 Home
          </Link>
        </div>

      </div>
    </div>
  );
}
