import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, HeartPulse, Building2, Map, LayoutDashboard } from 'lucide-react';
import { socket } from './socket';

import Dashboard from './pages/Dashboard';
import EmergencyInput from './pages/EmergencyInput';
import DecisionEngine from './pages/DecisionEngine';
import LiveResponse from './pages/LiveResponse';
import Hospital from './pages/Hospital';
import Metaverse from './pages/Metaverse';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const location = useLocation();

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/input', label: 'Input', icon: AlertTriangle },
    { path: '/decision', label: 'Decision', icon: Activity },
    { path: '/live', label: 'Live HUD', icon: HeartPulse },
    { path: '/hospital', label: 'Hospital', icon: Building2 },
    { path: '/metaverse', label: 'Metaverse', icon: Map },
  ];

  return (
    <div className="flex bg-slate-900 text-slate-50 min-h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <Activity className="h-8 w-8 text-red-500" />
          <h1 className="text-xl font-bold tracking-wider">AmbuAlert</h1>
        </div>
        
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'hover:bg-slate-700 text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto p-4 card text-sm">
          <div className="flex items-center gap-2 mb-2">
             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
             <span className="text-slate-400">System Link: {isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <button 
            className="text-xs text-slate-500 hover:text-slate-300 underline"
            onClick={() => {
              fetch('http://localhost:3000/api/decision', { method: 'POST' }).catch(() => {});
              socket.emit('reset_simulation');
            }}
          >
            Reset Simulation
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/input" element={<EmergencyInput />} />
          <Route path="/decision" element={<DecisionEngine />} />
          <Route path="/live" element={<LiveResponse />} />
          <Route path="/hospital" element={<Hospital />} />
          <Route path="/metaverse" element={<Metaverse />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
