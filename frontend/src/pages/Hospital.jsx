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
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
        <Building2 className="w-16 h-16 opacity-30" />
        <h2 className="text-xl font-bold uppercase tracking-widest">No Incoming Patients</h2>
        <p className="font-medium text-sm">Facility currently in standby mode.</p>
      </div>
    );
  }

  const { patient, hospital, ambulance } = sysState;
  const isCritical = patient.severity === 'CRITICAL';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
         <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm text-cyan-600">
           <Building2 className="w-8 h-8" />
         </div>
         <div>
            <h1 className="text-3xl font-black text-gray-800">{hospital.name}</h1>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-xs">Emergency Receiving Bay</p>
         </div>
      </div>

      <div className={`card mb-8 border-2 shadow-lg transition-all duration-500 ${isCritical ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
         <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Incoming Patient <span className="text-gray-800 font-black">{patient.id}</span></h3>
               <p className="text-xl font-bold text-gray-900 mt-1">{patient.type}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-black text-xs tracking-widest border ${isCritical ? 'bg-red-600 text-white border-red-700' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
               {patient.severity}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
               <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Arrival ETA</p>
               <p className="text-3xl font-black font-mono text-gray-800">{ambulance.eta} <span className="text-sm text-gray-500 font-sans uppercase">sec</span></p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
               <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Transport Unit</p>
               <p className="text-xl font-black text-cyan-600 uppercase tracking-tighter">{ambulance.id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
               <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Facility Status</p>
               <p className={`text-xl font-black uppercase tracking-tighter ${patient.status === 'DELIVERED' ? 'text-emerald-500' : 'text-cyan-500'}`}>
                 {patient.status.replace('_', ' ')}
               </p>
            </div>
         </div>
      </div>

      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Preparation Checklist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className={`card flex items-center gap-4 transition-all ${hospital.prepStatus.icuReady ? 'border-emerald-500 bg-emerald-50 shadow-emerald-500/10' : 'bg-gray-50'}`}>
            <div className={`p-2 rounded-lg ${hospital.prepStatus.icuReady ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
               <h4 className={`font-bold uppercase tracking-tight text-sm ${hospital.prepStatus.icuReady ? 'text-emerald-800' : 'text-gray-500'}`}>ICU Bed Status</h4>
               <p className={`text-xs font-medium ${hospital.prepStatus.icuReady ? 'text-emerald-600' : 'text-gray-400'}`}>{hospital.prepStatus.icuReady ? 'RESERVED & READY' : 'STANDBY'}</p>
            </div>
         </div>
         <div className="card flex items-center gap-4 border-emerald-500 bg-emerald-50 shadow-emerald-500/10">
            <div className="p-2 rounded-lg bg-emerald-500 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-bold uppercase tracking-tight text-sm text-emerald-800">Trauma Team</h4>
               <p className="text-xs font-medium text-emerald-600 uppercase">Scrubbed & Deployed</p>
            </div>
         </div>
      </div>
    </div>
  );
}
