import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useHospital } from '../context/HospitalContext';
import { 
  Building2, 
  Activity, 
  Users, 
  Clock, 
  Heart, 
  AlertTriangle,
  MoveUpRight,
  ShieldCheck,
  Stethoscope,
  Database,
  History,
  Trash2
} from 'lucide-react';

const socket = io('http://localhost:3000');

const HospitalHub = () => {
  const [sysState, setSysState] = useState(null);
  const { hospitals, admittedPatients, admitPatient, resetSystem } = useHospital();
  const hospitalProcessedRef = useRef(new Set()); // Prevents double admission in the same session

  useEffect(() => {
    socket.on('system_update', (state) => {
      setSysState(state);
      
      // Auto-Admission Logic
      const dispatched = state.ambulances?.find(a => a.id === state.dispatchedAmbulanceId);
      if (dispatched?.status === 'ARRIVED' && state.patient && !hospitalProcessedRef.current.has(state.patient.id)) {
        admitPatient(state.patient, state.hospital.id);
        hospitalProcessedRef.current.add(state.patient.id);
      }
    });

    return () => socket.off('system_update');
  }, [admitPatient]);

  if (!sysState) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Connecting to Healthcare Network...</p>
        </div>
      </div>
    );
  }

  const { patient, ambulances, dispatchedAmbulanceId, hospital: missionHospital } = sysState;
  const dispatched = ambulances?.find(a => a.id === dispatchedAmbulanceId);
  
  // Use the persistent hospital state for capacity display
  const activeHospital = missionHospital || hospitals[0];
  const persistentHosp = hospitals.find(h => h.id === activeHospital.id) || activeHospital;

  const isIncoming = dispatched && missionHospital && (dispatched.status !== 'ARRIVED');

  return (
    <div className="h-full bg-gray-50 overflow-hidden flex flex-col p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Clinical Intake Hub</h1>
            <p className="text-gray-400 text-sm font-medium italic">Persistent Medical Database Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={resetSystem}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl border border-gray-100 hover:border-rose-100 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <Trash2 size={14} /> Reset System
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase">Ready / Online</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Hospital Selection & Capacity */}
        <div className="col-span-4 flex flex-col gap-6 min-h-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-0">
             <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={14} className="text-indigo-400" /> Active Facility
             </h2>
             
             <div className="space-y-6 overflow-y-auto pr-2">
               <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <p className="text-lg font-black text-indigo-900">{persistentHosp.name}</p>
                 <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{persistentHosp.spec} SPECIALTY</p>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global ICU Capacity</p>
                      <p className="text-2xl font-black text-gray-900">{persistentHosp.availableBeds} / {persistentHosp.totalBeds}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                       style={{ width: `${(persistentHosp.availableBeds / persistentHosp.totalBeds) * 100}%` }}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <Database size={20} className="text-indigo-400 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase">Records</p>
                    <p className="text-sm font-black text-gray-800">{admittedPatients.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <ShieldCheck size={20} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase">Beds Util</p>
                    <p className="text-sm font-black text-gray-800">
                      {Math.round(((persistentHosp.totalBeds - persistentHosp.availableBeds) / persistentHosp.totalBeds) * 100)}%
                    </p>
                  </div>
               </div>
             </div>

             {/* Admitted Patient Ledger (PERSISTENT LIST) */}
             <div className="mt-8 flex-1 flex flex-col min-h-0 border-t border-gray-100 pt-6">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <History size={14} className="text-emerald-400" /> Patient Ledger
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                   {admittedPatients.length === 0 ? (
                     <p className="text-xs text-gray-300 font-medium italic text-center mt-4">No patients admitted yet</p>
                   ) : (
                     admittedPatients.map((p, idx) => (
                        <div key={`${p.id}-${idx}`} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                           <div>
                              <p className="text-xs font-black text-gray-800 tracking-tight">{p.id}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.type}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">{p.admittedAt}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-1">{p.severity}</p>
                           </div>
                        </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Incoming Patient Dashboard */}
        <div className="col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
          {!isIncoming ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Activity size={48} className="text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter italic">Standing By For Dispatch</h3>
              <p className="text-gray-400 max-w-sm mt-2 font-medium">Monitoring city data streams... No active dispatches toward this facility currently detected.</p>
            </div>
          ) : (
            <>
              {/* Alert Banner */}
              <div className="bg-rose-500 text-white p-4 flex justify-between items-center animate-pulse z-10">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">Priority Medical Intake Active — Destination Confirmed</span>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-tighter">
                  Hub Code: {persistentHosp.id}
                </span>
              </div>

              {/* Patient Profile */}
              <div className="p-10 flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 mb-10">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Transit</p>
                      <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{patient.id}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black uppercase ring-1 ring-rose-200">
                          {patient.severity} SEVERITY
                        </span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase ring-1 ring-indigo-200">
                          {patient.type}
                        </span>
                      </div>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center shadow-inner">
                      <div className="flex items-end gap-1">
                        <span className="text-6xl font-black text-indigo-600 tracking-tighter">
                          {Math.max(0, Math.ceil((dispatched.eta || 0) / 60))}
                        </span>
                        <span className="text-xl font-black text-indigo-300 pb-1">min</span>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">ETA TO ARRIVAL</p>
                   </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                   <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex flex-col items-center">
                      <Heart size={28} className="text-rose-500 mb-2 animate-bounce" />
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Heart Rate</p>
                      <p className="text-3xl font-black text-rose-600">{Math.round(patient.vitals?.heartRate || 0)} <span className="text-sm">BPM</span></p>
                   </div>
                   <div className="p-6 bg-sky-50 rounded-3xl border border-sky-100 flex flex-col items-center">
                      <Activity size={28} className="text-sky-500 mb-2" />
                      <p className="text-[10px] font-black text-sky-400 uppercase tracking-wider">SpO2 Level</p>
                      <p className="text-3xl font-black text-sky-600">{Math.round(patient.vitals?.oxygen || 0)}%</p>
                   </div>
                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center">
                      <MoveUpRight size={28} className="text-amber-500 mb-2" />
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Ambulance</p>
                      <p className="text-3xl font-black text-amber-600">{dispatched.id}</p>
                   </div>
                </div>

                {/* Live ECG Mock */}
                <div className="flex-1 bg-slate-900 rounded-4xl p-10 relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="relative flex flex-col h-full justify-between">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> LIVE MISSION FEED
                        </span>
                        <div className="font-mono text-emerald-800 text-[8px] space-y-1">
                          <div>VECTORS_STABLE::TRUE</div>
                          <div>ENCRYPTION::256BIT</div>
                        </div>
                     </div>
                     
                     <div className="flex-1 flex items-center justify-center py-6">
                        <svg className="w-full h-32 stroke-emerald-500 fill-none" viewBox="0 0 100 20">
                          <polyline points="0,10 10,10 12,2 16,18 18,10 30,10 32,5 34,15 36,10 50,10 52,0 56,20 58,10 70,10 72,5 74,15 76,10 100,10" 
                            strokeWidth="0.7" 
                            className="animate-[dash_3s_linear_infinite]" 
                            style={{ strokeDasharray: '100', strokeDashoffset: '100' }} 
                          />
                        </svg>
                     </div>

                     <div className="flex justify-between text-[10px] font-black text-emerald-900/50 uppercase italic tracking-widest">
                        <span>Terminal 09-ED</span>
                        <span>Clinical Sync: {Math.round(performance.now() % 1000)}ms Lag</span>
                     </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        .rounded-4xl { border-radius: 2.5rem; }
      `}} />
    </div>
  );
};

export default HospitalHub;
