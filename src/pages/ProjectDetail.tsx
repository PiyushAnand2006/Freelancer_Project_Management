import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  User, 
  ChevronLeft, 
  Send, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Box,
  ChevronRight,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    bidAmount: '',
    estimatedDays: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await axios.post('/api/proposals', {
        projectId: id,
        ...proposal
      });
      setMessage({ type: 'success', text: 'Proposal submitted successfully!' });
      setProposal({ coverLetter: '', bidAmount: '', estimatedDays: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit proposal' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <h1 className="text-3xl font-bold mb-4 tracking-tighter">Mission not found</h1>
      <Link to="/projects" className="text-blue-500 font-bold hover:underline">Back to Intelligence Hub</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-sm font-bold uppercase tracking-widest">Back to Directory</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Header Section */}
        <div className="lg:col-span-4 bento-card p-10 bg-gradient-to-r from-slate-900 to-slate-950">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${project.projectType === 'fixed' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                       {project.projectType}
                    </span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                       <Calendar className="w-3 h-3" /> {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight max-w-4xl">{project.title}</h1>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="text-blue-500 font-bold tracking-tighter text-3xl">
                    ${project.budgetMin}k - ${project.budgetMax}k
                 </div>
                 <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Estimated Budget</div>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bento-card p-10">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8">
                 <Box className="w-3 h-3" /> Project Intelligence
              </div>
              <div className="prose prose-invert max-w-none">
                 <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
                    {project.description}
                 </p>
              </div>
           </div>

           {/* Proposal Interface */}
           {user?.role === 'freelancer' && project.status === 'open' && (
              <div className="bento-card p-10">
                 <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-8">
                    <Send className="w-3 h-3" /> Transmission Center
                 </div>
                 <h3 className="text-3xl font-bold tracking-tighter mb-8">Apply for this Mission</h3>
                 
                 {message && (
                    <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                       {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                       <p className="font-bold">{message.text}</p>
                    </div>
                 )}

                 <form onSubmit={handleProposalSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Bid ($)</label>
                          <div className="relative">
                             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                             <input 
                                required
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                                value={proposal.bidAmount}
                                onChange={e => setProposal({ ...proposal, bidAmount: e.target.value })}
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Estimate (Days)</label>
                          <div className="relative">
                             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                             <input 
                                required
                                type="number"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                                value={proposal.estimatedDays}
                                onChange={e => setProposal({ ...proposal, estimatedDays: e.target.value })}
                             />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proposal Document</label>
                       <textarea 
                          required
                          placeholder="Detail your approach and relevant expertise..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-6 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[200px]"
                          value={proposal.coverLetter}
                          onChange={e => setProposal({ ...proposal, coverLetter: e.target.value })}
                       />
                    </div>
                    <button 
                       disabled={submitting}
                       className="group px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95"
                    >
                       {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                       Initiate Contact
                    </button>
                 </form>
              </div>
           )}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bento-card p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 border-b border-slate-800 pb-4">Client Dossier</h3>
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                       <User className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                       <p className="font-bold text-lg mb-1 leading-none">Security Clearance</p>
                       <div className="flex items-center gap-0.5 text-yellow-500">
                          {[1, 2, 3, 4].map(i => <span key={i}><Star className="w-3 h-3 fill-current" /></span>)}
                          <Star className="w-3 h-3 text-slate-700" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                       <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">Status</p>
                       <p className="font-bold text-green-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Fully Vetted
                       </p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                       <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">Total Funded</p>
                       <p className="font-bold text-white">$145k+</p>
                    </div>
                 </div>
              </div>

              <button className="w-full mt-8 py-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group">
                 Review Profile <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
