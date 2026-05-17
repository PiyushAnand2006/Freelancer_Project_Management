import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Briefcase, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="h-20 flex items-center justify-between px-8 bg-slate-950 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LanceFlow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94a3b8]">
          <Link to="/dashboard" className="text-white">Dashboard</Link>
          <Link to="/projects" className="hover:text-white transition-colors">Find Projects</Link>
          {user?.role === 'client' && <Link to="/projects/new" className="hover:text-white transition-colors">Post Project</Link>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/notifications" className="relative group">
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></div>
              <Bell className="w-6 h-6 text-[#94a3b8] group-hover:text-white transition-colors" />
            </Link>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
              <Link to="/profile/edit" className="text-right group hidden sm:block">
                <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{user.name}</p>
                <p className="text-xs text-blue-400 capitalize">{user.role}</p>
              </Link>
              <Link to="/profile/edit" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105">
              Get Started
            </Link>
          </div>
        )}
        
        {/* Mobile menu toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 w-full bg-slate-900 border-b border-slate-800 p-6 space-y-4 md:hidden shadow-2xl"
          >
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-300">Dashboard</Link>
            <Link to="/projects" onClick={() => setIsOpen(false)} className="block text-slate-300">Browse Projects</Link>
            {!user && (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-slate-300">Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full py-3 bg-blue-600 text-center text-white rounded-xl font-bold">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
