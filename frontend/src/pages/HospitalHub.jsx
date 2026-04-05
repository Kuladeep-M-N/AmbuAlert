import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Building2, 
  Activity, 
  Users, 
  Clock, 
  Heart, 
  AlertTriangle,
  MoveUpRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

const socket = io('http://localhost:3000');

const HospitalHub = () => {
  const [sysState, setSysState] = useState(null);

  useEffect(() => {
    socket.on('system_update', (state) => setSysState(state));
    return () => socket.off('system_update');
  }, []);

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

  const { patient, ambulances, dispatchedAmbulanceId, hospital } = sysState;
  const dispatched = ambulances?.find(a => a.id === dispatchedAmbulanceId);
  
  // Only show incoming if THIS hospital is the designated one
  const isIncoming = dispatched && hospital && (dispatched.status !== 'ARRIVED');

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
            <p className="text-gray-400 text-sm font-medium">Smart City Emergency Coordination</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Status</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase">Ready / Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Hospital Selection & Capacity */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
             <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={14} className="text-indigo-400" /> Active Facility
             </h2>
             
             {hospital ? (
               <div className="space-y-6">
                 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                   <p className="text-lg font-black text-indigo-900">{hospital.name}</p>
                   <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{hospital.spec} SPECIALTY</p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ICU Capacity</p>
                        <p className="text-2xl font-black text-gray-900">{hospital.availableBeds} / {hospital.totalBeds}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                        {Math.round((hospital.availableBeds / hospital.totalBeds) * 100)}% AVail
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                         style={{ width: `${(hospital.availableBeds / hospital.totalBeds) * 100}%` }}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Stethoscope size={20} className="text-indigo-400 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Specialization</p>
                      <p className="text-sm font-black text-gray-800">{hospital.spec}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <ShieldCheck size={20} className="text-emerald-400 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Trauma Level</p>
                      <p className="text-sm font-black text-gray-800">Level 1</p>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="h-40 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400">
                 No Active Facility Selected
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Incoming Patient Dashboard */}
        <div className="col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          {!isIncoming ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Activity size={48} className="text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter italic">Standing By For Dispatch</h3>
              <p className="text-gray-400 max-w-sm mt-2 font-medium">Monitoring all ambulance telemetry in the metropolitan area. System ready for clinical intake.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Alert Banner */}
              <div className="bg-rose-500 text-white p-4 flex justify-between items-center animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">Priority Emergency Intake Incoming</span>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-tighter">
                  Dispatch ID: {dispatched.id}
                </span>
              </div>

              {/* Patient Profile */}
              <div className="p-8 flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Incoming Victim</p>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">{patient.id}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black uppercase ring-1 ring-rose-200">
                          {patient.severity} SEVERITY
                        </span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase ring-1 ring-indigo-200">
                          {patient.type}
                        </span>
                      </div>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-black text-indigo-600 tracking-tighter">
                          {Math.max(0, Math.ceil((dispatched.eta || 0) / 60))}
                        </span>
                        <span className="text-xl font-black text-indigo-300 pb-1">min</span>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">ETA TO ARRIVAL</p>
                   </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                   <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex flex-col items-center">
                      <Heart size={24} className="text-rose-500 mb-2 animate-bounce" />
                      <p className="text-[10px] font-black text-rose-400 uppercase">Heart Rate</p>
                      <p className="text-2xl font-black text-rose-600">{Math.round(patient.vitals?.heartRate || 0)} BPM</p>
                   </div>
                   <div className="p-6 bg-sky-50 rounded-3xl border border-sky-100 flex flex-col items-center">
                      <Activity size={24} className="text-sky-500 mb-2" />
                      <p className="text-[10px] font-black text-sky-400 uppercase">SpO2 Level</p>
                      <p className="text-2xl font-black text-sky-600">{Math.round(patient.vitals?.oxygen || 0)}%</p>
                   </div>
                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center">
                      <MoveUpRight size={24} className="text-amber-500 mb-2" />
                      <p className="text-[10px] font-black text-amber-400 uppercase">Ambulance</p>
                      <p className="text-2xl font-black text-amber-600">{dispatched.id}</p>
                   </div>
                </div>

                {/* Live ECG Mock */}
                <div className="flex-1 bg-black rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="relative flex flex-col h-full">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> LIVE TELEMETRY STREAM
                        </span>
                        <span className="text-[10px] font-mono text-emerald-800">SCANNING_VECTORS...</span>
                     </div>
                     <div className="flex-1 flex items-center justify-center">
                        <svg className="w-full h-24 stroke-emerald-500 fill-none" viewBox="0 0 100 20">
                          <path d="M0 10 H20 L22 2 L26 18 L28 10 H100" strokeWidth="0.5" className="animate-[dash_2s_linear_infinite]" style={{ strokeDasharray: '100', strokeDashoffset: '100' }} />
                        </svg>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
};

export default HospitalHub;
