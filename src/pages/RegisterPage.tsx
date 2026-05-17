import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, User, Briefcase, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    hourlyRate: '',
    experienceYears: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/register', { ...formData, role });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bento-card p-10 lg:p-12 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-gradient-x"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-6">
               Operator Enrollment
            </div>
            <h1 className="text-5xl font-bold tracking-tighter mb-2">New Identity Matrix.</h1>
            <p className="text-slate-400 text-sm">Join the next evolution of global work.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-4 mb-10">
            <button 
              type="button"
              onClick={() => setRole('client')}
              className={`flex-1 p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${role === 'client' ? 'border-blue-500 bg-blue-600/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}
            >
              <div className={`p-3 rounded-2xl ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <User className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${role === 'client' ? 'text-white' : 'text-slate-500'}`}>I'm a Client</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('freelancer')}
              className={`flex-1 p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${role === 'freelancer' ? 'border-blue-500 bg-blue-600/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}
            >
              <div className={`p-3 rounded-2xl ${role === 'freelancer' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${role === 'freelancer' ? 'text-white' : 'text-slate-500'}`}>I'm a Freelancer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interface Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required
                    type="email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                    placeholder="john@matrix.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Key</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {role === 'freelancer' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-6 border-t border-slate-800"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hourly Rate (USD)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                      placeholder="50"
                      value={formData.hourlyRate}
                      onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Experience (Years)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                      placeholder="5"
                      value={formData.experienceYears}
                      onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Professional Protocol (Bio)</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[120px]"
                    placeholder="Describe your capabilities..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl py-5 font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  Initialize Identity
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
               <p className="text-slate-500 text-sm">
                 Existing operator? <Link to="/login" className="text-white font-bold hover:text-blue-500 transition-colors">Sign In &rarr;</Link>
               </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
