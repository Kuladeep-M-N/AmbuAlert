import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, HeartPulse, Building2, Map, LayoutDashboard, Database, Settings } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

const Sidebar = ({ isConnected, onReset }) => {
  const location = useLocation();
  const { role, roles, hasAccess } = useRole();

  const allNavLinks = [
    { id: 'dashboard', path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', path: '/app/input', label: 'Incident Injection', icon: AlertTriangle },
    { id: 'decision', path: '/app/decision', label: 'AI Engine', icon: Activity },
    { id: 'live', path: '/app/live', label: 'Response HUD', icon: HeartPulse },
    { id: 'hospital', path: '/app/hospital', label: 'Hospital Hub', icon: Building2 },
    { id: 'metaverse', path: '/app/metaverse', label: 'Metaverse Ops', icon: Map },
  ];

  const filteredLinks = allNavLinks.filter(link => hasAccess(link.id));

  return (
    <nav className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-6 h-screen sticky top-0">
      <Link to="/" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
        <Activity className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-xl font-bold tracking-wider text-slate-50">AmbuAlert</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{roles[role].label}</p>
        </div>
      </Link>
      
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-4 mb-2">Systems</p>
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5' 
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 card bg-slate-900/50 border-slate-700/50 text-xs">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
               <span className="text-slate-400">Hub Status: {isConnected ? 'Online' : 'Offline'}</span>
             </div>
          </div>
          
          <div className="space-y-2">
            {role === 'admin' && (
              <button 
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-colors"
                onClick={onReset}
              >
                <Database className="h-3 w-3" />
                Reset System
              </button>
            )}

            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded text-red-400 font-bold transition-all"
            >
              <LogOut className="h-3 w-3" />
              Exit Control Center
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2 text-slate-500 text-[10px] font-medium uppercase tracking-widest">
          <span>v1.0.4 - STABLE</span>
          <Settings className="h-3 w-3 cursor-pointer hover:text-slate-300" />
        </div>
      </div>
    </nav>
  );
};

// Internal icon import
import { LogOut } from 'lucide-react';

export default Sidebar;
