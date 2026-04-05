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
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800">System Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">AmbuAlert AI Gateway Overview</p>
        </div>
        <button 
          onClick={() => navigate('/app/input')}
          className="btn btn-primary shadow-sm flex items-center gap-2"
        >
          <Activity className="h-5 w-5"/>
          Start Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'System Status', value: sysState?.systemStatus || 'OFFLINE', icon: Server, color: sysState?.systemStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-gray-400' },
          { label: 'Active Incidents', value: sysState?.systemStatus === 'ACTIVE' ? '1' : '0', icon: Radio, color: 'text-cyan-600' },
          { label: 'Available Ambulances', value: '14', icon: Activity, color: 'text-indigo-500' },
          { label: 'Hospitals Online', value: '4', icon: Users, color: 'text-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-3 hover:border-gray-300 hover:shadow-md transition-all">
            <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card flex-1 flex flex-col justify-center items-center text-gray-400 border-dashed border-2 border-gray-200 bg-gray-50/50 p-6 min-h-0">
        <Server className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium">Simulation telemetry will render here once initiated.</p>
        <button 
          onClick={() => navigate('/app/input')}
          className="mt-4 text-cyan-600 font-bold hover:underline"
        >
          Inject new emergency event &rarr;
        </button>
      </div>
    </div>
  );
}
