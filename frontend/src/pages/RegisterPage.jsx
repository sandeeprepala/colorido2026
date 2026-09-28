import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MorphSelect from '../components/common/MorphSelect';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    college: 'Apex Institute of Technology',
    department: 'Computer Science',
    year: '2nd Year',
    student_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/my-festival');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="font-display font-black text-3xl tracking-tight text-[#121217]">
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
          <h2 className="font-display font-black text-2xl text-[#121217] tracking-tight">
            Create Student Festival Account
          </h2>
          <p className="text-xs font-semibold text-stone-500">
            Join competitions, reserve carnival stalls, and get your digital QR passes
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sandeep Sharma"
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
                placeholder="e.g. sandeep@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
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

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                Year of Study
              </label>
              <MorphSelect
                value={formData.year}
                onChange={(val) => setFormData({ ...formData, year: val })}
                placeholder="Select Year"
                width="100%"
                options={[
                  { value: '1st Year', label: '1st Year' },
                  { value: '2nd Year', label: '2nd Year' },
                  { value: '3rd Year', label: '3rd Year' },
                  { value: '4th Year', label: '4th Year' },
                  { value: 'Postgraduate', label: 'Postgraduate' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. CS23B104"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E91E63] hover:bg-[#d81557] text-white py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : (
              <>
                <Sparkles className="w-4 h-4" />
                CREATE ACCOUNT &amp; CONTINUE
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-200 text-xs font-bold text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="text-[#8E44FF] hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
