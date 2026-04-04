import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { Activity, Radio, Server, Users } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sysState, setSysState] = useState(null);

  useEffect(() => {
    socket.on('system_update', (data) => {
      setSysState(data);
    });
    // fetch initial fetch
    fetch('http://localhost:3000/api/status')
      .then(res => res.json())
      .then(data => setSysState(data));

    return () => socket.off('system_update');
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Dashboard</h1>
          <p className="text-slate-400">AmbuAlert AI Gateway Overview</p>
        </div>
        <button 
          onClick={() => navigate('/app/input')}
          className="btn btn-primary shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Activity className="h-5 w-5"/>
          Start Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'System Status', value: sysState?.systemStatus || 'OFFLINE', icon: Server, color: sysState?.systemStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400' },
          { label: 'Active Incidents', value: sysState?.systemStatus === 'ACTIVE' ? '1' : '0', icon: Radio, color: 'text-blue-500' },
          { label: 'Available Ambulances', value: '14', icon: Activity, color: 'text-indigo-500' },
          { label: 'Hospitals Online', value: '4', icon: Users, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-900 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card h-64 flex flex-col justify-center items-center text-slate-500 border-dashed border-2">
        <Server className="h-12 w-12 mb-4 opacity-50" />
        <p>Simulation telemetry will render here once initiated.</p>
        <button 
          onClick={() => navigate('/app/input')}
          className="mt-4 text-blue-400 hover:underline"
        >
          Inject new emergency event &rarr;
        </button>
      </div>
    </div>
  );
}
