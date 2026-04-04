import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Building2, Eye, X } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

const RoleSelector = ({ onClose }) => {
  const { roles, updateRole } = useRole();
  const navigate = useNavigate();

  const handleSelectRole = (roleKey) => {
    updateRole(roleKey);
    navigate('/app/dashboard');
    onClose();
  };

  const roleConfigs = [
    { key: 'admin', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10' },
    { key: 'dispatcher', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'hospital', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'viewer', icon: Eye, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Access Control Center</h2>
          <p className="text-slate-400 text-sm">Please select your operational role to enter the simulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleConfigs.map((config) => {
            const roleInfo = roles[config.key];
            const Icon = config.icon;
            
            return (
              <button 
                key={config.key}
                onClick={() => handleSelectRole(config.key)}
                className="group p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left transition-all hover:bg-slate-800 hover:border-slate-600 hover:scale-[1.02] flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                   <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                
                <div className="flex-1">
                   <div className="text-lg font-bold text-slate-50 mb-1 flex items-center justify-between">
                     {roleInfo.label}
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-black text-slate-500">Select</div>
                   </div>
                   <div className="text-xs text-slate-400 leading-relaxed">
                     Access to: {roleInfo.access.join(', ')}
                   </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
             Authorized Personnel Only. All session actions are recorded via Socket.IO Audit Log. <br />
             System Version v1.0.4-STABLE.
           </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
