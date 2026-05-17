import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { User, Briefcase, Link as LinkIcon, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileEdit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    hourlyRate: '',
    experienceYears: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    profilePic: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.freelancerProfile?.bio || '',
        hourlyRate: user.freelancerProfile?.hourlyRate || '',
        experienceYears: user.freelancerProfile?.experienceYears || '',
        portfolioUrl: user.freelancerProfile?.portfolioUrl || '',
        githubUrl: user.freelancerProfile?.githubUrl || '',
        linkedinUrl: user.freelancerProfile?.linkedinUrl || '',
        profilePic: user.profilePic || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/users/profile', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider">
            Account Management
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">Identity & <br /> Profile Matrix.</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Section */}
          <div className="bento-card p-10 bg-slate-900">
             <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">
                <User className="w-3 h-3" /> Core Identity
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                   <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avatar Reference (URL)</label>
                   <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                      value={formData.profilePic}
                      onChange={e => setFormData({...formData, profilePic: e.target.value})}
                   />
                </div>
             </div>
          </div>

          {/* Specialization Section */}
          {user?.role === 'freelancer' && (
             <div className="bento-card p-10 bg-slate-900">
                <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">
                   <Briefcase className="w-3 h-3" /> Technical Specialization
                </div>
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Professional Bio</label>
                      <textarea 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-6 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[150px]"
                         value={formData.bio}
                         onChange={e => setFormData({...formData, bio: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rate (USD/hr)</label>
                         <input 
                            type="number"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                            value={formData.hourlyRate}
                            onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience (Cycles/Years)</label>
                         <input 
                            type="number"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                            value={formData.experienceYears}
                            onChange={e => setFormData({...formData, experienceYears: e.target.value})}
                         />
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bento-card p-8">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">
                 <LinkIcon className="w-3 h-3" /> Network Links
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Portfolio</label>
                    <input 
                       type="text"
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                       value={formData.portfolioUrl}
                       onChange={e => setFormData({...formData, portfolioUrl: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub</label>
                    <input 
                       type="text"
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                       value={formData.githubUrl}
                       onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">LinkedIn</label>
                    <input 
                       type="text"
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                       value={formData.linkedinUrl}
                       onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                 {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                 Synchronize Profile
              </button>
              
              <AnimatePresence>
                 {success && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-center font-bold text-sm"
                    >
                       Synchronization Complete.
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </form>
    </div>
  );
}
