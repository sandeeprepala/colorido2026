import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Upload,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { registrationsAPI, volunteerAPI } from '../../services/api';

/**
 * Play a crisp, pleasant 2-tone chime using Web Audio API (no external asset needed)
 */
const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // 2-tone chord: E6 (1318.5Hz) & G#6 (1661.2Hz)
    osc1.frequency.setValueAtTime(1318.5, ctx.currentTime);
    osc2.frequency.setValueAtTime(1661.2, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.08);
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);

    if (navigator.vibrate) {
      navigator.vibrate([60, 30, 80]);
    }
  } catch (e) {
    // Audio might be blocked until user gesture, ignore safely
  }
};

/**
 * Extract pass token or registration ID from raw QR text or full verification URL (localhost or deployed)
 */
export const extractPassToken = (rawText) => {
  if (!rawText) return '';
  let text = String(rawText).trim();

  // Strip outer quotes if any
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }

  // Handle URL format: http(s)://.../registration/verify/TOKEN (matches localhost, 127.0.0.1, or deployed link)
  if (text.includes('/registration/verify/')) {
    const parts = text.split('/registration/verify/');
    if (parts[1]) {
      return decodeURIComponent(parts[1].split('?')[0].split('#')[0].replace(/\/+$/, '').trim());
    }
  }

  // Handle general verify format: .../verify/TOKEN
  if (text.includes('/verify/')) {
    const parts = text.split('/verify/');
    if (parts[1]) {
      return decodeURIComponent(parts[1].split('?')[0].split('#')[0].replace(/\/+$/, '').trim());
    }
  }

  // Handle URL with query params
  try {
    if (text.startsWith('http://') || text.startsWith('https://')) {
      const url = new URL(text);
      const tokenParam =
        url.searchParams.get('token') ||
        url.searchParams.get('id') ||
        url.searchParams.get('registration_id') ||
        url.searchParams.get('qr_token');
      if (tokenParam) return decodeURIComponent(tokenParam.trim());

      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        return decodeURIComponent(segments[segments.length - 1].trim());
      }
    }
  } catch (e) {
    // Not a valid URL, treat as raw token
  }

  // Handle JSON encoded QR
  try {
    if (text.startsWith('{') && text.endsWith('}')) {
      const parsed = JSON.parse(text);
      const val = parsed.qr_token || parsed.token || parsed.registration_id || parsed.id;
      if (val) return String(val).trim();
    }
  } catch (e) {}

  return text;
};

export default function RealTimeQRScanner({
  onParticipantScanned,
  onAttendanceMarked,
  autoCheckInDefault = false,
  showHistory = true,
}) {
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(autoCheckInDefault);

  // Participant details state
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [scanError, setScanError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Attendance action state
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);

  // Scan history / session log
  const [scanHistory, setScanHistory] = useState([]);

  // Internal refs
  const scannerRef = useRef(null);
  const scannerContainerId = 'realtime-qr-viewport';
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  // Fetch participant details in real time
  const fetchParticipantDetails = useCallback(
    async (tokenOrId, shouldAutoCheck = autoCheckIn) => {
      const token = extractPassToken(tokenOrId);
      if (!token) return;

      setLoadingDetails(true);
      setScanError('');
      setAttendanceResult(null);

      try {
        const res = await registrationsAPI.verifyQrToken(token);
        const data = res.data;

        setParticipant(data);
        playSuccessChime();

        // Add to recent history (most recent first, max 10)
        setScanHistory((prev) => [
          {
            id: data.registration_id,
            name: data.participant_name,
            event: data.event_name,
            status: data.status,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prev.filter((item) => item.id !== data.registration_id).slice(0, 9),
        ]);

        if (onParticipantScanned) {
          onParticipantScanned(data);
        }

        // Auto Check-in if enabled and pass is confirmed (not already attended)
        if (shouldAutoCheck && data.status !== 'attended') {
          await triggerCheckIn(data.id || data.registration_id || token, data);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Invalid QR pass or registration record not found.';
        setScanError(errorMsg);
        setParticipant(null);
      } finally {
        setLoadingDetails(false);
        // Cooldown reset after 1.5 seconds
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1500);
      }
    },
    [autoCheckIn, onParticipantScanned]
  );

  // Handle successful QR code decode from camera or image
  const handleDecodedText = useCallback(
    (decodedText) => {
      const now = Date.now();
      const token = extractPassToken(decodedText);

      // Prevent duplicate scan of same token within 3 seconds
      if (
        isProcessingRef.current ||
        (token === lastScannedTokenRef.current && now - lastScanTimeRef.current < 3000)
      ) {
        return;
      }

      isProcessingRef.current = true;
      lastScannedTokenRef.current = token;
      lastScanTimeRef.current = now;

      fetchParticipantDetails(token);
    },
    [fetchParticipantDetails]
  );

  // Start Html5Qrcode camera
  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError('');

      // Stop existing instance if running
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
        } catch (e) {
          // ignore cleanup issues
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, { verbose: false });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: mode },
        config,
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // Frame scan failure (no QR in frame), silent
        }
      );

      setIsScanning(true);

      // Check torch capability
      try {
        const track = html5QrCode.getRunningTrackCapabilities();
        if (track && 'torch' in track) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      } catch (e) {
        setTorchSupported(false);
      }
    } catch (err) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        err?.message?.includes('Permission')
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Unable to access camera. Check device permissions or try uploading a QR image.'
      );
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  // Toggle Camera Facing Mode (Environment vs User)
  const toggleFacingMode = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isScanning) {
      await startCamera(nextMode);
    }
  };

  // Toggle Flashlight / Torch
  const toggleTorch = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Scan from uploaded image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingDetails(true);
    setScanError('');

    try {
      let qrScanner = scannerRef.current;
      if (!qrScanner) {
        qrScanner = new Html5Qrcode(scannerContainerId, { verbose: false });
        scannerRef.current = qrScanner;
      }

      // If camera was active, stop it before scanning file
      if (isScanning) {
        await qrScanner.stop();
        setIsScanning(false);
      }

      const decodedText = await qrScanner.scanFile(file, true);
      handleDecodedText(decodedText);
    } catch (err) {
      setScanError('Could not decode QR code from the selected image. Please try a clearer picture.');
      setLoadingDetails(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Manual code submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    fetchParticipantDetails(manualInput.trim());
  };

  // Mark Attendance / Check In
  const triggerCheckIn = async (idOrToken, currentParticipant = participant) => {
    const rawTarget = idOrToken || currentParticipant?.id || currentParticipant?.registration_id;
    const target = extractPassToken(rawTarget);
    if (!target) return;

    setMarkingAttendance(true);
    try {
      const res = await volunteerAPI.checkIn({ token: target });
      const data = res.data;

      setAttendanceResult({
        success: true,
        alreadyAttended: !!data.alreadyAttended,
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Update participant status in view
      setParticipant((prev) => (prev ? { ...prev, status: 'attended' } : null));

      // Update recent history entry
      setScanHistory((prev) =>
        prev.map((item) =>
          item.id === currentParticipant?.registration_id
            ? { ...item, status: 'attended' }
            : item
        )
      );

      if (onAttendanceMarked) {
        onAttendanceMarked(data);
      }
    } catch (err) {
      setAttendanceResult({
        success: false,
        error: err.response?.data?.error || 'Failed to record check-in.',
      });
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Reset current participant and resume scanning
  const handleScanNext = () => {
    setParticipant(null);
    setScanError('');
    setAttendanceResult(null);
    setManualInput('');
    lastScannedTokenRef.current = '';
    isProcessingRef.current = false;

    if (!isScanning) {
      startCamera(facingMode);
    }
  };

  // Copy registration ID to clipboard
  const copyRegId = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-3 border-[#121217] rounded-3xl p-4 sm:p-5 fest-shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E91E63] text-white flex items-center justify-center font-black shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-[#121217] leading-tight">
              Real-Time Gate Scanner
            </h3>
            <p className="text-xs font-semibold text-stone-500">
              Live webcam & mobile camera decoder with instant participant verification
            </p>
          </div>
        </div>

        {/* Auto Check-in Toggle & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#121217] bg-stone-50 text-xs font-black cursor-pointer hover:bg-stone-100 transition-colors">
            <input
              type="checkbox"
              checked={autoCheckIn}
              onChange={(e) => setAutoCheckIn(e.target.checked)}
              className="accent-[#7ED957] w-4 h-4 cursor-pointer"
            />
            <span>Auto Check-in on Scan</span>
          </label>

          {isScanning ? (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#121217] bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider fest-shadow-sm transition-all"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={() => startCamera(facingMode)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#121217] bg-[#7ED957] hover:bg-[#6ec34a] text-[#121217] font-black text-xs uppercase tracking-wider fest-shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Scanner Viewport (Left) & Participant Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewport & Scanning Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#121217] border-3 border-[#121217] rounded-3xl p-4 sm:p-5 fest-shadow-lg text-white space-y-4 overflow-hidden relative">
            {/* Viewport Header & Camera Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
                <span className="text-xs font-black uppercase tracking-wider text-stone-300">
                  {isScanning ? 'Active Camera Feed' : 'Camera Standby'}
                </span>
              </div>

              {isScanning && (
                <div className="flex items-center gap-2">
                  {torchSupported && (
                    <button
                      onClick={toggleTorch}
                      title="Toggle Flashlight"
                      className={`p-2 rounded-xl border border-white/20 transition-all ${
                        torchOn ? 'bg-amber-400 text-stone-900' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={toggleFacingMode}
                    title="Flip Camera (Front/Rear)"
                    className="p-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Viewport Container */}
            <div className="relative w-full aspect-square max-h-[380px] bg-black/90 rounded-2xl overflow-hidden border-2 border-dashed border-stone-700 flex items-center justify-center">
              {/* Html5Qrcode video mounting element */}
              <div
                id={scannerContainerId}
                className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
              />

              {/* Laser beam animation & target reticle (shown when camera is active) */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Glowing Reticle Box */}
                  <div className="relative w-[240px] h-[240px] rounded-2xl border-2 border-emerald-400/40">
                    {/* Corner Reticle Accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#19CFE8] rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#19CFE8] rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#19CFE8] rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#19CFE8] rounded-br-lg" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#E91E63] to-transparent shadow-[0_0_12px_#E91E63] animate-bounce" />
                  </div>
                </div>
              )}

              {/* Standby Placeholder */}
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-stone-900/90 backdrop-blur-xs space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400">
                    <Camera className="w-8 h-8 stroke-1" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-white text-base">Camera Not Active</h4>
                    <p className="text-xs text-stone-400 max-w-xs mt-1">
                      Click below to turn on the live camera scanner or upload an image containing a QR code.
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="mt-2 px-5 py-2.5 bg-[#7ED957] hover:bg-[#6ec34a] text-[#121217] font-black text-xs uppercase tracking-wider rounded-full border-2 border-[#121217] fest-shadow-sm transition-all inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Launch Live Camera</span>
                  </button>
                </div>
              )}

              {/* Scanning Active Overlay Notification */}
              {isScanning && (
                <div className="absolute bottom-3 inset-x-4 bg-black/60 backdrop-blur-md rounded-xl py-1.5 px-3 border border-white/10 text-center">
                  <p className="text-[11px] font-bold text-stone-300 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD43B]" />
                    <span>Align participant QR pass inside the target square</span>
                  </p>
                </div>
              )}
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Alternative Scan Actions (Upload QR Image & Manual Search) */}
            <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-image-upload-input"
              />
              <label
                htmlFor="qr-image-upload-input"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black cursor-pointer border border-white/10 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#19CFE8]" />
                <span>Upload QR Image</span>
              </label>

              <span className="text-[11px] font-bold text-stone-400">
                Facing: <strong className="text-white capitalize">{facingMode}</strong>
              </span>
            </div>
          </div>

          {/* Manual Input Search Fallback */}
          <div className="bg-white border-3 border-[#121217] rounded-3xl p-5 fest-shadow-sm space-y-3">
            <h4 className="font-display font-black text-sm text-[#121217] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8E44FF]" />
              <span>Manual Participant Code Lookup</span>
            </h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. COL-2026-ABCD or qr-..."
                className="flex-1 px-4 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:bg-white"
              />
              <button
                type="submit"
                disabled={loadingDetails || !manualInput.trim()}
                className="px-5 py-2.5 bg-[#121217] hover:bg-[#8E44FF] text-white rounded-xl font-black text-xs uppercase tracking-wider border-2 border-[#121217] fest-shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {loadingDetails ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Real-time Participant Details Display */}
        <div className="lg:col-span-6 space-y-4">
          {/* Loading Indicator */}
          {loadingDetails && (
            <div className="bg-white border-3 border-[#121217] rounded-3xl p-10 fest-shadow text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#121217] border-t-[#E91E63] rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-display font-black text-lg text-[#121217]">
                  Decoding Participant Data...
                </h4>
                <p className="text-xs font-semibold text-stone-500 mt-1">
                  Verifying cryptographic token with festival registry
                </p>
              </div>
            </div>
          )}

          {/* Scan Error Message */}
          {scanError && !loadingDetails && (
            <div className="bg-rose-50 border-3 border-rose-500 rounded-3xl p-6 sm:p-7 fest-shadow space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-lg text-rose-900">
                    Verification Failed
                  </h4>
                  <p className="text-xs font-bold text-rose-700">{scanError}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleScanNext}
                  className="px-4 py-2 bg-white hover:bg-stone-100 text-[#121217] font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#121217] fest-shadow-sm transition-all"
                >
                  Try Another Pass
                </button>
              </div>
            </div>
          )}

          {/* Participant Details Card (Real-Time Result) */}
          {participant && !loadingDetails && (
            <div className="bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-7 fest-shadow-lg space-y-5 animate-in zoom-in-95">
              {/* Header Badge & Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  {participant.status === 'attended' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border-2 border-amber-400 text-xs font-black uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Already Attended</span>
                    </span>
                  ) : participant.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-xs font-black uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Valid Entry Pass</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 border-2 border-stone-300 text-xs font-black uppercase">
                      <span>Status: {participant.status}</span>
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-stone-500">
                    {participant.event_category}
                  </span>
                </div>

                <button
                  onClick={handleScanNext}
                  className="px-3 py-1.5 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-[#FFD43B] text-[#121217] text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                >
                  <span>Scan Next</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Participant Profile Banner */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8E44FF] to-[#E91E63] text-white flex items-center justify-center font-display font-black text-2xl border-2 border-[#121217] fest-shadow-sm shrink-0">
                  {participant.participant_name ? participant.participant_name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-black text-2xl text-[#121217] truncate leading-tight">
                    {participant.participant_name}
                  </h3>
                  <p className="text-xs font-black text-[#8E44FF] mt-0.5 truncate">
                    {participant.event_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-300 inline-flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-[#121217]" />
                      <span>{participant.registration_id}</span>
                    </span>
                    <button
                      onClick={() => copyRegId(participant.registration_id)}
                      className="text-stone-400 hover:text-[#121217] transition-colors p-1"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Key-Value Grid */}
              <div className="bg-[#FAF8F5] border-2 border-[#121217] rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <span className="text-stone-500 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email:</span>
                  </span>
                  <strong className="text-[#121217] font-semibold truncate max-w-[220px]">
                    {participant.student_email || 'N/A'}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <span className="text-stone-500 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Phone:</span>
                  </span>
                  <strong className="text-[#121217] font-mono font-bold">
                    {participant.student_phone || 'N/A'}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <span className="text-stone-500 font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>College & Dept:</span>
                  </span>
                  <strong className="text-[#121217] font-semibold text-right">
                    {participant.college} {participant.department ? `(${participant.department})` : ''}
                  </strong>
                </div>

                {participant.student_id_number && (
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <span className="text-stone-500 font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Student ID / Roll:</span>
                    </span>
                    <strong className="text-[#121217] font-mono font-bold">
                      {participant.student_id_number}
                    </strong>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <span className="text-stone-500 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Venue & Schedule:</span>
                  </span>
                  <span className="font-bold text-stone-800 text-right">
                    {participant.venue || 'Central Campus'} • {participant.start_time || 'TBA'}
                  </span>
                </div>

                {/* Team Info if Team Event */}
                {participant.team_name && (
                  <div className="bg-white p-2.5 rounded-xl border border-stone-300 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-black text-[#8E44FF]">Team:</span>
                      <strong className="text-[#121217] font-bold">{participant.team_name}</strong>
                    </div>
                    {participant.team_members && participant.team_members.length > 0 && (
                      <p className="text-[10px] text-stone-500 font-medium">
                        Members: {participant.team_members.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Attendance Result Notice */}
              {attendanceResult && (
                <div
                  className={`p-3.5 rounded-2xl border-2 text-xs font-bold flex items-start gap-2.5 animate-in zoom-in-95 ${
                    attendanceResult.success
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : 'bg-rose-50 border-rose-500 text-rose-900'
                  }`}
                >
                  {attendanceResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block">
                      {attendanceResult.success
                        ? attendanceResult.alreadyAttended
                          ? 'Pass already recorded at ' + attendanceResult.time
                          : 'Gate Entry Recorded at ' + attendanceResult.time
                        : attendanceResult.error}
                    </strong>
                    {attendanceResult.success && !attendanceResult.alreadyAttended && (
                      <span className="text-[11px] text-emerald-700">
                        Participant marked present. Festival badge authorized.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {participant.status !== 'attended' ? (
                  <button
                    onClick={() => triggerCheckIn(participant.id || participant.registration_id)}
                    disabled={markingAttendance}
                    className="flex-1 bg-[#7ED957] hover:bg-[#6ec34a] text-[#121217] py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {markingAttendance ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Attendance & Admit</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 border-2 border-stone-300 text-stone-700 text-center font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Admitted ({participant.checkin_time || 'Checked In'})</span>
                  </div>
                )}

                <button
                  onClick={handleScanNext}
                  className="bg-[#121217] hover:bg-[#E91E63] text-white py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-[#121217] fest-shadow transition-all flex items-center justify-center gap-2"
                >
                  <span>Next Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Empty Standby State */}
          {!participant && !loadingDetails && !scanError && (
            <div className="bg-white border-3 border-dashed border-[#121217] rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF8F5] border-2 border-[#121217] flex items-center justify-center mx-auto text-stone-400 fest-shadow-sm">
                <Ticket className="w-8 h-8 stroke-1 text-[#E91E63]" />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="font-display font-black text-lg text-[#121217]">
                  Awaiting Participant Pass
                </h4>
                <p className="text-xs font-semibold text-stone-500 mt-1">
                  Point the camera at an attendee's digital pass or festival badge to view their real-time details instantly.
                </p>
              </div>
            </div>
          )}

          {/* Recent Scans Session Log */}
          {showHistory && scanHistory.length > 0 && (
            <div className="bg-white border-3 border-[#121217] rounded-3xl p-5 fest-shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-stone-700">
                  Recent Session Scans ({scanHistory.length})
                </h4>
                <button
                  onClick={() => setScanHistory([])}
                  className="text-[11px] font-bold text-stone-400 hover:text-rose-600 transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {scanHistory.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => fetchParticipantDetails(item.id, false)}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <strong className="block text-[#121217] truncate">{item.name}</strong>
                      <span className="text-[11px] text-stone-500 truncate block">
                        {item.event} • <span className="font-mono">{item.id}</span>
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.status === 'attended'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="block text-[10px] text-stone-400 mt-0.5">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
