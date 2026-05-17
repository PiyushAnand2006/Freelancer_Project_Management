import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Zap, DollarSign, ArrowRight, Star, CheckCircle2, Briefcase, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              Future of Freelancing <br /> is here.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12">
              Connect with top-tier talent and forge powerful partnerships on our high-performance platform. Secure, fast, and built for scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/20 transition-all hover:scale-105">
                Join the Network
              </Link>
              <Link to="/projects" className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                Explore Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-3 bento-card h-[400px] relative overflow-hidden flex flex-col justify-end">
             <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full"></div>
             <Shield className="w-12 h-12 text-blue-500 mb-6" />
             <h3 className="text-3xl font-bold mb-4">Secure Transactions</h3>
             <p className="text-slate-400">Escrow-powered payments ensure that you get paid for every milestone, on time.</p>
          </div>
          <div className="md:col-span-3 bento-card h-[400px] flex flex-col justify-end">
             <Zap className="w-12 h-12 text-blue-500 mb-6" />
             <h3 className="text-3xl font-bold mb-4">Rapid Matching</h3>
             <p className="text-slate-400">Our intelligent algorithm connects you with the perfect project or talent in seconds.</p>
          </div>
          <div className="md:col-span-2 bento-card min-h-[300px]">
             <CheckCircle2 className="w-10 h-10 text-green-500 mb-6" />
             <h4 className="text-xl font-bold mb-2">Verified Talent</h4>
             <p className="text-sm text-slate-400">Every freelancer is vetted for technical proficiency and professional excellence.</p>
          </div>
          <div className="md:col-span-2 bento-card min-h-[300px]">
             <Clock className="w-10 h-10 text-blue-500 mb-6" />
             <h4 className="text-xl font-bold mb-2">Real-time Collab</h4>
             <p className="text-sm text-slate-400">Communicate and manage files seamlessly within our integrated contract space.</p>
          </div>
          <div className="md:col-span-2 bento-card min-h-[300px]">
             <Briefcase className="w-10 h-10 text-purple-500 mb-6" />
             <h4 className="text-xl font-bold mb-2">Global Scale</h4>
             <p className="text-sm text-slate-400">From Mumbai to New York, connect with a global network of innovators.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <Briefcase className="w-4 h-4 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-tight">LanceFlow</span>
           </div>
           <p className="text-slate-500 text-sm">© 2026 LanceFlow Platform. All rights reserved.</p>
           <div className="flex gap-8 text-sm text-slate-400">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#" className="hover:text-white transition-colors">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
