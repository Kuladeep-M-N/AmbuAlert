import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { Building2, Stethoscope, BedDouble, AlertCircle } from 'lucide-react';

export default function Hospital() {
  const [sysState, setSysState] = useState(null);

  useEffect(() => {
    socket.on('system_update', (data) => {
      setSysState(data);
    });
    return () => socket.off('system_update');
  }, []);

  if (!sysState || sysState.systemStatus !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
        <Building2 className="w-16 h-16 opacity-50" />
        <h2 className="text-xl font-bold">No Incoming Patients</h2>
      </div>
    );
  }

  const { patient, hospital, ambulance } = sysState;
  const isCritical = patient.severity === 'CRITICAL';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
         <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
           <Building2 className="w-8 h-8 text-blue-500" />
         </div>
         <div>
            <h1 className="text-3xl font-bold">{hospital.name}</h1>
            <p className="text-slate-400">Emergency Receiving Bay</p>
         </div>
      </div>

      <div className={`card mb-8 border-2 ${isCritical ? 'border-red-500 bg-red-500/5' : 'border-slate-700'}`}>
         <div className="flex justify-between items-start border-b border-slate-700/50 pb-4 mb-4">
            <div>
               <h3 className="text-lg font-bold text-slate-300">Incoming Patient <span className="text-white">{patient.id}</span></h3>
               <p className="text-sm text-slate-400 mt-1">Incident: {patient.type}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${isCritical ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-400'}`}>
               {patient.severity}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <p className="text-sm text-slate-400 mb-1">ETA</p>
               <p className="text-3xl font-mono font-bold text-white">{ambulance.eta} <span className="text-base text-slate-500">sec</span></p>
            </div>
            <div>
               <p className="text-sm text-slate-400 mb-1">Transport Vehicle</p>
               <p className="text-xl font-bold text-white">{ambulance.id}</p>
            </div>
            <div>
               <p className="text-sm text-slate-400 mb-1">Status</p>
               <p className={`text-xl font-bold ${patient.status === 'DELIVERED' ? 'text-emerald-500' : 'text-blue-500'}`}>
                 {patient.status.replace('_', ' ')}
               </p>
            </div>
         </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Preparation Checklist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className={`card flex items-center gap-4 ${hospital.prepStatus.icuReady ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}>
            <BedDouble className={`w-8 h-8 ${hospital.prepStatus.icuReady ? 'text-emerald-500' : 'text-slate-500'}`} />
            <div>
               <h4 className="font-bold text-slate-200">ICU Bed</h4>
               <p className="text-sm text-slate-400">{hospital.prepStatus.icuReady ? 'Reserved & Ready' : 'Standby / Not Required'}</p>
            </div>
         </div>
         <div className="card flex items-center gap-4 border-emerald-500/50 bg-emerald-500/5">
            <Stethoscope className="w-8 h-8 text-emerald-500" />
            <div>
               <h4 className="font-bold text-slate-200">Medical Team</h4>
               <p className="text-sm text-slate-400">Scrubbed & Standing By</p>
            </div>
         </div>
      </div>
    </div>
  );
}
