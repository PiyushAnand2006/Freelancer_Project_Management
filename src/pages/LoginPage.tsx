import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/login', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bento-card p-10 lg:p-12 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-gradient-x"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-6">
               Secure Access
            </div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">Back to the Matrix.</h1>
            <p className="text-slate-400 text-sm">Synchronize your workstation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interface Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                  placeholder="name@matrix.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                <Link to="/forgot-password" disable-link="true" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">Recovery</Link>
              </div>
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

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl py-5 font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  Establish Connection
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
               <p className="text-slate-500 text-sm">
                 New operator? <Link to="/register" className="text-white font-bold hover:text-blue-500 transition-colors">Initialize ID &rarr;</Link>
               </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
