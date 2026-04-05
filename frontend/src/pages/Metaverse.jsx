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
    <div className="flex flex-col min-h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
           <Map className="w-6 h-6 text-cyan-600" />
           Metaverse Visualization Layer
         </h1>
         <div className="card py-2 px-4 flex gap-4 text-xs font-bold uppercase tracking-widest border-gray-200 bg-white shadow-sm">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${sysState?.systemStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
             State: <span className="text-gray-900">{sysState?.systemStatus || 'IDLE'}</span>
           </div>
           {sysState?.ambulance && (
             <div className="border-l border-gray-100 pl-4 text-cyan-600">
               ETA: <span>{sysState.ambulance.eta}s</span>
             </div>
           )}
         </div>
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative shadow-inner">
        <MetaverseScene sysState={sysState} />
        
        {/* Abstract Overlays manually overlaid over canvas */}
        <div className="absolute top-4 left-4 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 text-[10px] text-gray-500 font-bold tracking-widest uppercase pointer-events-none shadow-sm">
          <p className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
            WebGL Engine: Active
          </p>
          <p className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 ${sysState?.systemStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'} rounded-full`}></div>
            Simulation Style: {sysState?.systemStatus === 'ACTIVE' ? 'LIVE DATA' : 'STANDBY'}
          </p>
        </div>
      </div>
    </div>
  );
}
