import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, HeartPulse, Building2, Map, LayoutDashboard, Database, Settings, LogOut } from 'lucide-react';
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
    <nav className="w-64 bg-gray-100 border-r border-gray-200 p-4 flex flex-col gap-6 h-screen sticky top-0">
      <Link to="/" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
        <Activity className="h-8 w-8 text-cyan-600" />
        <div>
          <h1 className="text-xl font-bold tracking-wider text-gray-800">AmbuAlert</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{roles[role].label}</p>
        </div>
      </Link>
      
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-4 mb-2">Systems</p>
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-sm' 
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm">{link.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-xs">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`}></div>
               <span className="text-gray-500 font-medium">Hub Status: {isConnected ? 'Online' : 'Offline'}</span>
             </div>
          </div>
          
          <div className="space-y-2">
            {role === 'admin' && (
              <button 
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-600 font-semibold transition-colors"
                onClick={onReset}
              >
                <Database className="h-3 w-3" />
                Reset System
              </button>
            )}

            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-600 font-bold transition-all"
            >
              <LogOut className="h-3 w-3" />
              Exit Control Center
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          <span>v1.0.4 - STABLE</span>
          <Settings className="h-3 w-3 cursor-pointer hover:text-gray-600" />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
