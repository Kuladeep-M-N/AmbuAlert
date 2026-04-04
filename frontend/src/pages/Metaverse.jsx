import { useEffect, useState } from 'react';
import { socket } from '../socket';
import MetaverseScene from '../components/MetaverseScene';
import { Map } from 'lucide-react';

export default function Metaverse() {
  const [sysState, setSysState] = useState(null);

  useEffect(() => {
    socket.on('system_update', (data) => {
      setSysState(data);
    });
    return () => socket.off('system_update');
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold flex items-center gap-3">
           <Map className="w-6 h-6 text-blue-500" />
           Metaverse Visualization Layer
         </h1>
         <div className="card py-2 px-4 flex gap-4 text-sm font-mono border-slate-700">
           <div>State: <span className="text-white">{sysState?.systemStatus || 'IDLE'}</span></div>
           {sysState?.ambulance && <div>ETA: <span className="text-blue-400">{sysState.ambulance.eta}s</span></div>}
         </div>
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 bg-black relative shadow-2xl">
        <MetaverseScene sysState={sysState} />
        
        {/* Abstract Overlays manually overlaid over canvas */}
        <div className="absolute top-4 left-4 p-4 rounded bg-slate-900/60 backdrop-blur border border-slate-800 text-xs text-slate-400 font-mono pointer-events-none">
          <p>WebGL Renderer Active</p>
          <p>Simulation Engine: {sysState?.systemStatus === 'ACTIVE' ? 'RUNNING' : 'STANDBY'}</p>
        </div>
      </div>
    </div>
  );
}
