import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Loader2,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractRes, messagesRes] = await Promise.all([
          axios.get(`/api/contracts/${id}`),
          axios.get(`/api/messages/${id}`)
        ]);
        setContract(contractRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket Setup
    socketRef.current = io();
    socketRef.current.emit('join-contract', id);

    socketRef.current.on('new-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      contractId: id,
      senderId: user?.userId,
      senderName: user?.name,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    socketRef.current?.emit('send-message', messageData);
    setNewMessage('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 h-[calc(100vh-200px)]">
        
        {/* Left/Main: Contract & Milestones */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Contract Details</h1>
              <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold uppercase tracking-widest">{contract.status}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pt-8 border-t border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Freelancer</p>
                <p className="font-semibold">Freelancer Nickname</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Amount</p>
                <p className="font-semibold">${contract.agreedAmount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Start Date</p>
                <p className="font-semibold">{format(new Date(contract.startDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Signed</p>
                <p className="font-semibold">{format(new Date(contract.signedAt), 'MMM dd')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Project Milestones</h2>
              {user?.role === 'client' && (
                <button className="flex items-center gap-2 text-blue-500 font-bold hover:underline">
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
              )}
            </div>
            
            {[1, 2].map((m) => (
              <div key={m} className={`bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-between group hover:border-slate-700 transition-all`}>
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${m === 1 ? 'bg-green-600' : 'bg-slate-800'}`}>
                    {m === 1 ? <CheckCircle2 className="w-6 h-6" /> : m}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Milestone Title {m}</h3>
                    <p className="text-sm text-slate-500">Fixed Amount: $500 • Due May 20, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {user?.role === 'freelancer' && m === 2 && (
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">Submit Work</button>
                  )}
                  <div className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    <MoreVertical className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Message Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Messages
            </h3>
            <div className="flex items-center gap-4 text-slate-500">
               <span className="text-xs">Contract #{id}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                <FileText className="w-12 h-12 " />
                <p className="text-sm">No messages yet. <br/> Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === user?.userId ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.senderId === user?.userId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                    {msg.senderId !== user?.userId && <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-50">{msg.senderName}</p>}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] mt-2 opacity-50 text-right">{format(new Date(msg.timestamp), 'HH:mm')}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef}></div>
          </div>

          <div className="p-6 bg-slate-800/10 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text"
                placeholder="Type your message..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-5 pr-24 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button type="button" className="p-2 text-slate-500 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="submit" className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
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
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    );
  }
