import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MapPin, Clock, DollarSign, Tag, ChevronRight, Briefcase, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectBrowse() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`/api/projects?search=${search}`);
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider">
            Explore Opportunities
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">Find Your Next <br /> Big Project.</h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search by keywords, skills..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bento-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            <div className="space-y-6">
                <div>
                   <label className="text-sm font-medium text-slate-400 block mb-3">Project Type</label>
                   <div className="grid grid-cols-1 gap-2">
                      {['Fixed Price', 'Hourly'].map(type => (
                        <button key={type} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm hover:border-blue-500/30 transition-all text-left flex items-center justify-between group">
                           {type}
                           <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-blue-500" />
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-sm font-medium text-slate-400 block mb-3">Experience Level</label>
                   <div className="grid grid-cols-1 gap-2">
                      {['Entry', 'Intermediate', 'Expert'].map(level => (
                        <button key={level} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm hover:border-blue-500/30 transition-all text-left">
                           {level}
                        </button>
                      ))}
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Project Feed */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bento-card bg-slate-900 border border-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.projectId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bento-card p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-6">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${project.projectType === 'fixed' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                          {project.projectType}
                       </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-blue-500 text-xs font-bold mb-4 uppercase tracking-widest">
                        <Tag className="w-3 h-3" /> Mission
                      </div>
                      <Link to={`/projects/${project.projectId}`}>
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors leading-tight">{project.title}</h2>
                      </Link>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 border-y border-slate-800 py-4">
                        <div className="flex items-center gap-2">
                           <DollarSign className="w-4 h-4 text-slate-500" />
                           <span className="font-bold text-slate-200">${project.budgetMin}k+</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                           <Clock className="w-4 h-4" />
                           <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold">{i}</div>
                            ))}
                            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[8px] font-bold">+5</div>
                         </div>
                         <Link 
                           to={`/projects/${project.projectId}`}
                           className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                         >
                           Bid Now <ChevronRight className="w-3 h-3" />
                         </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
                <div className="text-center py-32 bento-card bg-slate-900/40 border-dashed">
                  <Briefcase className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">No projects found</h3>
                  <p className="text-slate-500">Refine your search parameters to see more results.</p>
                </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
