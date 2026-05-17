import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FilePlus, Layout, DollarSign, Calendar, Globe, Loader2, ArrowRight } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    projectType: 'fixed',
    visibility: 'public',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/projects', formData);
      navigate(`/projects/${res.data.projectId}`);
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
            Client Portal
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">Draft a New <br /> Mission.</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-10 bg-slate-900">
             <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 text-slate-500">
                <Layout className="w-3 h-3" /> Core Logistics
             </div>
             <div className="space-y-8">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mission Title</label>
                   <input 
                      type="text"
                      required
                      placeholder="e.g. Architecting a Secure Decentralized Edge Gateway"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-slate-700"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operational Detail</label>
                   <textarea 
                      required
                      placeholder="Specify the technical requirements, milestones, and security protocols..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-6 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[300px] placeholder:text-slate-700"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bento-card p-8">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">
                 <DollarSign className="w-3 h-3" /> Resource Allocation
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contract Type</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['fixed', 'hourly'].map(type => (
                         <button 
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, projectType: type})}
                            className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-tighter transition-all ${formData.projectType === type ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                         >
                            {type}
                         </button>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Floor (k$)</label>
                      <input 
                         type="number"
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                         value={formData.budgetMin}
                         onChange={e => setFormData({...formData, budgetMin: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ceiling (k$)</label>
                      <input 
                         type="number"
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                         value={formData.budgetMax}
                         onChange={e => setFormData({...formData, budgetMax: e.target.value})}
                      />
                   </div>
                </div>
              </div>
           </div>

           <div className="bento-card p-8">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">
                 <Calendar className="w-3 h-3" /> Temporal Protocol
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Deadline</label>
                 <input 
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                 />
              </div>
           </div>

           <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                 <>
                    Deploy Mission
                    <ArrowRight className="w-5 h-5" />
                 </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}
