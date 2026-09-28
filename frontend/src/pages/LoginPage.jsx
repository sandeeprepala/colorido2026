import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/my-festival');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border-3 border-[#121217] rounded-3xl p-6 sm:p-10 fest-shadow-xl space-y-6">
        
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
            Festival Account Login
          </h2>
          <p className="text-xs font-semibold text-stone-500">
            Sign in with your student or administrator credentials
          </p>
        </div>

        {/* Credentials Info Callout */}
        <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 text-xs font-semibold text-stone-600 space-y-1.5">
          <p className="font-bold text-[#121217] uppercase text-[11px] tracking-wider">
            Festival Access Credentials:
          </p>
          <div className="flex justify-between items-center text-[11px]">
            <span>Student: <strong className="text-[#121217]">sandeep</strong></span>
            <span>Password: <strong className="font-mono text-stone-800">colorido@2026</strong></span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span>Admin: <strong className="text-[#8E44FF]">admin</strong></span>
            <span>Password: <strong className="font-mono text-stone-800">colorido@2026</strong></span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              placeholder="e.g. sandeep or admin"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border-2 border-[#121217] rounded-xl text-sm font-semibold focus:outline-hidden focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121217] hover:bg-[#E91E63] text-white py-3.5 rounded-full font-black text-sm border-2 border-[#121217] fest-shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Festival</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-200 text-xs font-bold text-stone-600">
          New student?{' '}
          <Link to="/register" className="text-[#E91E63] hover:underline">
            Register your Festival Pass
          </Link>
        </div>

      </div>
    </div>
  );
}
