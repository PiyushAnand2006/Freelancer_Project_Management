import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Briefcase, FileText, CreditCard, AlertCircle, CheckCircle2, Loader2, MailOpen } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'proposal': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'contract': return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case 'milestone': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-orange-500" />;
      case 'dispute': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Notifications</h1>
          <p className="text-slate-400">Stay updated with your project activities</p>
        </div>
        <button className="text-sm text-blue-500 font-bold hover:underline flex items-center gap-2">
          <MailOpen className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center opacity-50">
            <Bell className="w-12 h-12 mx-auto mb-4" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div 
                key={n.notificationId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-slate-900 border ${n.isRead ? 'border-slate-800 shadow-sm' : 'border-blue-500/30 bg-blue-500/5 shadow-lg shadow-blue-500/5'} rounded-2xl p-6 flex gap-6 group transition-all hover:bg-slate-800/40 cursor-pointer`}
                onClick={() => !n.isRead && markAsRead(n.notificationId)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${n.isRead ? 'bg-slate-800' : 'bg-blue-500/10'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${n.isRead ? 'text-slate-200' : 'text-white'}`}>{n.title}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                      {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{n.message}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ring-4 ring-blue-500/20 animate-pulse"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
