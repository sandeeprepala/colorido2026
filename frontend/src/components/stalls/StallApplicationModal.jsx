import React, { useState } from 'react';
import { X, Store, Utensils, Gamepad2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { stallsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function StallApplicationModal({ stall, onClose, onSuccess }) {
  const { user } = useAuth();

  const isFood = stall?.type === 'food';

  const [formData, setFormData] = useState({
    stall_id: stall?.stall_id || '',
    type: stall?.type || 'food',
    applicant_name: user?.name || '',
    applicant_email: user?.email || '',
    applicant_phone: user?.phone || '',
    college: user?.college || 'Apex Institute of Technology',
    item_name: '',
    description: '',
    price: isFood ? '₹100 - ₹150' : '₹50 per attempt',
    rules: '',
    requirements: 'Standard single phase 5A socket, waste bin.',
    manager_count: 2,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await stallsAPI.applyForStall(formData);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(res.data.application);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit stall application.');
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

        {isSubmitted ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto mb-4 fest-shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#121217] mb-2">
              Application Submitted!
            </h3>
            
            <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
              Your application for <strong>Stall {stall?.stall_id} ({stall?.type.toUpperCase()})</strong> has been received with status <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PENDING</span>. You will receive an email notification once reviewed by the Festival Committee.
            </p>

            <button
              onClick={onClose}
              className="bg-[#121217] hover:bg-[#E91E63] text-white px-8 py-3 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all"
            >
              Back to Stall Map
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
              <div className={`p-3 rounded-2xl text-white fest-shadow-sm ${
                isFood ? 'bg-[#FF7A00]' : 'bg-[#8E44FF]'
              }`}>
                {isFood ? <Utensils className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-[#121217]">
                    Stall {stall?.stall_id} Application
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isFood ? 'bg-orange-100 text-[#FF7A00]' : 'bg-purple-100 text-[#8E44FF]'
                  }`}>
                    {stall?.type}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-500">
                  Zone: {stall?.section || 'Festival Pavilion'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Applicant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.applicant_phone}
                    onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              {/* Product / Activity Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    {isFood ? 'Food Item / Specialty Name *' : 'Game / Activity Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isFood ? 'e.g. Smash Gourmet Burgers' : 'e.g. Ring The Giant Plushie'}
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    {isFood ? 'Price Range *' : 'Entry Ticket Price *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isFood ? 'e.g. ₹100 - ₹180' : 'e.g. ₹50 for 5 throws'}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                  Description of Food or Experience *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={isFood ? 'Describe menu items, hygiene practices, and taste profile...' : 'Explain the gameplay mechanics, fun challenge, and rewards...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                />
              </div>

              {!isFood && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Game Rules &amp; Victory Conditions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 attempts to knock all 6 cans completely off table"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Special Equipment / Utilities
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15A socket, LPG safety permit, water"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Team Members Managing Stall
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.manager_count}
                    onChange={(e) => setFormData({ ...formData, manager_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#121217] hover:bg-[#FF7A00] text-white py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting Application...' : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      SUBMIT APPLICATION FOR STALL {stall?.stall_id}
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
