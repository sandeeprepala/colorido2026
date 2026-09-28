import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';
import { registrationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function RegistrationModal({ event, onClose, onSuccess }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || 'Apex Institute of Technology',
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    student_id: user?.student_id || '',
    team_name: '',
  });

  const minTeam = Math.max(1, Number(event?.min_team_size) || 1);
  const maxTeam = Math.max(minTeam, Number(event?.max_team_size) || minTeam);
  const isSolo = maxTeam === 1;

  // Initialize team members to satisfy minTeam - 1 if possible
  const initialExtraMembersCount = Math.max(0, minTeam - 1);
  const [teamMembers, setTeamMembers] = useState(
    isSolo ? [] : Array.from({ length: Math.min(1, initialExtraMembersCount) }, () => '')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedRegistration, setConfirmedRegistration] = useState(null);

  const handleAddMember = () => {
    // Current total is 1 (leader) + teamMembers.length
    if (1 + teamMembers.length >= maxTeam) {
      setError(`Maximum team size for ${event.name} is ${maxTeam} members.`);
      return;
    }
    setError('');
    setTeamMembers([...teamMembers, '']);
  };

  const handleRemoveMember = (idx) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, val) => {
    const updated = [...teamMembers];
    updated[idx] = val;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validExtraMembers = teamMembers.filter((m) => m && m.trim().length > 0);
    const totalSquad = 1 + validExtraMembers.length;

    if (!isSolo) {
      if (!formData.team_name.trim()) {
        setError(`A Team Name is required for "${event.name}".`);
        return;
      }
      if (totalSquad < minTeam) {
        setError(`"${event.name}" requires at least ${minTeam} members (including team leader). You currently have ${totalSquad}.`);
        return;
      }
      if (totalSquad > maxTeam) {
        setError(`"${event.name}" allows at most ${maxTeam} members. You currently have ${totalSquad}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        team_name: isSolo ? '' : formData.team_name.trim(),
        team_members: isSolo ? [] : validExtraMembers,
      };

      const res = await registrationsAPI.registerForEvent(event.id, payload);
      setConfirmedRegistration(res.data.registration);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E91E63', '#FF7A00', '#FFD43B', '#19CFE8', '#7ED957', '#8E44FF'],
      });

      if (onSuccess) {
        onSuccess(res.data.registration);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-3 border-[#121217] fest-shadow-xl p-6 sm:p-8 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border-2 border-[#121217] bg-stone-100 hover:bg-stone-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#121217]" />
        </button>

        {/* CONFIRMATION SCREEN */}
        {confirmedRegistration ? (
          <div className="text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>REGISTRATION CONFIRMED</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#121217] tracking-tight">
              🎉 YOU'RE REGISTERED!
            </h2>

            <p className="font-bold text-lg text-[#E91E63] mt-1">
              {event.name}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-stone-600 my-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                {event.event_date} · {event.start_time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E91E63]" />
                {event.venue}
              </span>
            </div>

            {/* QR Card */}
            <div className="bg-[#FAF8F5] border-2 border-dashed border-[#121217] rounded-2xl p-5 my-5 max-w-sm mx-auto">
              <div className="p-3 bg-white border-2 border-[#121217] rounded-xl fest-shadow-sm inline-block">
                <QRCodeSVG
                  value={`${window.location.origin}/registration/verify/${confirmedRegistration.qr_token}`}
                  size={160}
                  level="H"
                />
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">
                  Registration ID
                </span>
                <span className="font-mono font-black text-lg bg-[#FFD43B] text-[#121217] px-3 py-1 rounded-md border border-[#121217] inline-block mt-0.5">
                  {confirmedRegistration.registration_id}
                </span>
              </div>

              <p className="text-xs font-bold text-stone-600 mt-3">
                "Show this QR code at the event entrance."
              </p>
            </div>

            <p className="text-xs text-stone-500 mb-6">
              A confirmation email has been dispatched to <strong>{confirmedRegistration.student_email}</strong>.
            </p>

            <button
              onClick={onClose}
              className="bg-[#121217] hover:bg-[#E91E63] text-white px-8 py-3 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all"
            >
              Done &amp; Return to Events
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div>
            <div className="mb-6">
              <span className="text-xs font-black uppercase text-[#8E44FF] tracking-wider block mb-1">
                {event.category} EVENT REGISTRATION
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121217]">
                Register for {event.name}
              </h2>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                {event.venue} · {event.event_date} at {event.start_time}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    College / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE / ECE"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Roll / Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS23B104"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              {/* Team Information */}
              {/* Team Information or Solo Notice */}
              <div className="pt-2 border-t border-stone-200">
                {isSolo ? (
                  <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-900 tracking-wider">
                        Solo / Individual Event (1 Participant)
                      </p>
                      <p className="text-xs font-medium text-emerald-800 mt-0.5">
                        This event is strictly for individual competitors. You are registering as the sole participant under your credentials.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                        <span>👥 Team / Squad Details</span>
                        <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-[#8E44FF] border border-purple-200">
                          Allowed: {minTeam} - {maxTeam} Members
                        </span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                          1 + teamMembers.filter((m) => m && m.trim().length > 0).length >= minTeam &&
                          1 + teamMembers.filter((m) => m && m.trim().length > 0).length <= maxTeam
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          Current: {1 + teamMembers.filter((m) => m && m.trim().length > 0).length} / {maxTeam}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 font-semibold">
                      You count as <strong>Member 1 (Team Leader)</strong>. Add {minTeam > 1 ? `between ${minTeam - 1} and ${maxTeam - 1}` : `up to ${maxTeam - 1}`} teammates below.
                    </p>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Team / Squad Name (e.g. Code Knights, Thunder XI) *"
                        value={formData.team_name}
                        onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-400 w-5 text-right">{idx + 2}.</span>
                          <input
                            type="text"
                            placeholder={`Team Member ${idx + 2} Full Name`}
                            value={member}
                            onChange={(e) => handleMemberChange(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="p-2 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {1 + teamMembers.length < maxTeam ? (
                        <button
                          type="button"
                          onClick={handleAddMember}
                          className="text-xs font-bold text-[#8E44FF] hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Member {2 + teamMembers.length} (Max {maxTeam})
                        </button>
                      ) : (
                        <p className="text-[11px] font-bold text-stone-400 italic pt-1">
                          Maximum squad limit reached ({maxTeam} members total).
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E91E63] hover:bg-[#d81557] text-white py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Processing Registration...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      CONFIRM REGISTRATION &amp; GET QR
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
