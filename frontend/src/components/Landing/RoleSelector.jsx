import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Clock, Map, LayoutDashboard, Database, Settings, LogOut, X, ChevronRight, Play } from 'lucide-react';

const RoleSelector = ({ onSelect, onClose }) => {
  const roles = [
    {
      key: 'admin',
      header: 'Incident Commander',
      label: 'ADMIN OPS',
      icon: LayoutDashboard,
      color: 'text-red-500',
      bg: 'bg-red-50',
      desc: 'Full system oversight, incident injection, and global resource dispatch.'
    },
    {
      key: 'paramedic',
      header: 'Field Responder',
      label: 'EMS / PARAMEDIC',
      icon: Activity,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      desc: 'Live telemetry tracking, turn-by-turn routing, and patient vital monitoring.'
    },
    {
      key: 'doctor',
      header: 'ER Specialist',
      label: 'HOSPITAL / MD',
      icon: HeartPulse,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      desc: 'Inbound patient readiness, bed allocation, and trauma team prep.'
    },
    {
      key: 'public',
      header: 'Crisis Management',
      label: 'DISPATCH / PUBLIC',
      icon: Map,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Traffic coordination, citizen notification, and spatial awareness.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel: Context */}
          <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-100 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
                <Activity className="w-64 h-64 text-cyan-500" />
             </div>

             <div className="relative z-10">
                <div className="bg-cyan-600 w-12 h-1.5 rounded-full mb-6"></div>
                <h2 className="text-3xl font-black text-gray-800 leading-tight mb-4">Select Operations Console</h2>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Choose your specialized interface to begin real-time incident coordination and resource management.
                </p>
             </div>

             <div className="mt-8 flex items-center gap-3 relative z-10">
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Awaiting Authorization...</span>
             </div>
          </div>

          {/* Right Panel: Roles */}
          <div className="md:w-2/3 p-8 bg-white relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role, idx) => (
                <motion.button
                  key={role.key}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-6 rounded-2xl border border-gray-100 bg-white text-left transition-all hover:bg-gray-50 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-600/5 relative overflow-hidden"
                  onClick={() => onSelect(role.key)}
                >
                   {/* Background Highlight */}
                   <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 transition-opacity group-hover:opacity-100"></div>

                   <div className={`w-12 h-12 rounded-xl ${role.bg} ${role.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <role.icon className="w-6 h-6" />
                   </div>
                   
                   <div className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-1">
                      {role.label}
                   </div>
                   <h3 className="text-lg font-black text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">
                      {role.header}
                   </h3>
                   <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">
                      {role.desc}
                   </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;
