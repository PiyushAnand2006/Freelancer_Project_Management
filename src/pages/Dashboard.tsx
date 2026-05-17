import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Clock, 
  MoreVertical,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const data = [
  { name: 'Jan', earnings: 4000 },
  { name: 'Feb', earnings: 3000 },
  { name: 'Mar', earnings: 2000 },
  { name: 'Apr', earnings: 2780 },
  { name: 'May', earnings: 1890 },
  { name: 'Jun', earnings: 2390 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching stats
    setTimeout(() => {
      setStats({
        activeProjects: 3,
        totalEarned: 12450,
        pendingInvoices: 2,
        avgRating: 4.9,
        activeContracts: 2,
        openProposals: 5,
        totalSpent: 8400
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-6 gap-4">
        
        {/* Main/Hero (2x3) */}
        <div className="md:col-span-2 md:row-span-3 bento-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <LayoutDashboard className="w-32 h-32 text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {user?.role === 'freelancer' ? 'Active Contract' : 'Current Priority'}
              </span>
              <h2 className="text-2xl font-bold mt-3">E-commerce Platform Redesign</h2>
              <p className="text-slate-400 text-sm mt-1">Client: MetaTech Solutions Inc.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono text-white tracking-tighter font-bold">$4,200.00</p>
              <p className="text-xs text-slate-500">Fixed Price</p>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-300">Milestone 3 of 5: Payment API Integration</span>
                <span className="text-blue-400 font-bold">65%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Due Date</p>
                <p className="text-lg font-semibold mt-1 text-white">Oct 24, 2026</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Status</p>
                <p className="text-lg font-semibold mt-1 text-green-400">On Track</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            Submit Deliverable
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chart (2x2) */}
        <div className="md:col-span-2 md:row-span-2 bento-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Revenue Over Time</h3>
            <select className="bg-slate-900 text-xs border border-slate-700 rounded-lg px-2 py-1 outline-none">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEarnings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Stat 1 (1x1) */}
        <div className="md:col-span-1 md:row-span-1 bento-card flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">${stats.totalEarned.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{user?.role === 'freelancer' ? 'Total Earned' : 'Total Spent'}</p>
          </div>
        </div>

        {/* Small Stat 2 (1x1) */}
        <div className="md:col-span-1 md:row-span-1 bento-card flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{stats.avgRating}</p>
            <p className="text-xs text-slate-500">Average Rating</p>
          </div>
        </div>

        {/* Messages (1x3) */}
        <div className="md:col-span-1 md:row-span-3 bento-card flex flex-col">
          <h3 className="font-bold mb-4 flex items-center justify-between">
            Messages
            <Link to="/messages" className="text-[10px] text-blue-400">View All</Link>
          </h3>
          <div className="space-y-4 flex-grow custom-scrollbar overflow-y-auto">
            {[
              { name: 'Sarah Johnson', msg: 'Did you see the new assets I...', img: 'https://i.pravatar.cc/100?u=sarah' },
              { name: 'Mark Webber', msg: 'The invoice has been paid!', img: 'https://i.pravatar.cc/100?u=mark' },
              { name: 'System', msg: 'New proposal received', img: 'https://i.pravatar.cc/100?u=system', highlight: true }
            ].map((chat, i) => (
              <div key={i} className="flex gap-3 items-center group cursor-pointer">
                <img src={chat.img} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">{chat.name}</p>
                  <p className={`text-[10px] truncate ${chat.highlight ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>{chat.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <p className="text-[10px] text-center text-blue-400 font-medium">You have 3 unread messages</p>
          </div>
        </div>

        {/* Deadlines (1x3) */}
        <div className="md:col-span-1 md:row-span-3 bento-card">
          <h3 className="font-bold mb-4">Deadlines</h3>
          <div className="space-y-4">
            <div className="pl-3 border-l-2 border-red-500">
              <p className="text-xs font-bold">API Documentation</p>
              <p className="text-[10px] text-red-400">Due in 2 hours</p>
            </div>
            <div className="pl-3 border-l-2 border-orange-500">
              <p className="text-xs font-bold">UI Kit Export</p>
              <p className="text-[10px] text-orange-400">Due Tomorrow</p>
            </div>
            <div className="pl-3 border-l-2 border-slate-600">
              <p className="text-xs font-bold">Client Meeting</p>
              <p className="text-[10px] text-slate-400">Friday, 10:00 AM</p>
            </div>
          </div>
        </div>

        {/* Skill Profile (2x1) */}
        <div className="md:col-span-2 md:row-span-1 bg-gradient-to-r from-blue-600/20 to-transparent border border-slate-700 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['JS', 'R', 'DB', 'UX'].map(s => (
                <div key={s} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 text-[10px] font-bold">{s}</div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold">Skills Proficiency</p>
              <p className="text-[10px] text-slate-400">Verified Expert in 12 categories</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors">
            Manage Portfolio
          </button>
        </div>

      </div>
    </div>
  );
}

// Internal Star component for the stats mapping
function Star({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
