import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import {
  AlertTriangle, Clock, HeartPulse, LocateFixed,
  Radio, Zap, CheckCircle, Activity, ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const glowStyles = `
  .route-best {
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .route-halo {
    opacity: 0.3;
    filter: blur(2px);
  }
  .route-alt {
    stroke-dasharray: 6, 8;
    opacity: 0.5;
  }
  .route-traffic {
    stroke-dasharray: 2, 8;
    opacity: 0.4;
  }
`;

// ─── Leaflet Icons ────────────────────────────────────────────────────────────

const idleAmbIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:20px;height:20px;
      background:#9ca3af;
      border:2px solid white;
      border-radius:5px;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;
      box-shadow:0 2px 6px rgba(0,0,0,0.15);
      opacity:0.75;
    ">🚑</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const dispatchedAmbIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:28px;height:28px;
      background:#0ea5e9;
      border:3px solid white;
      border-radius:7px;
      display:flex;align-items:center;justify-content:center;
      font-size:15px;
      box-shadow:0 0 0 4px rgba(14,165,233,0.35), 0 0 20px rgba(14,165,233,0.6);
      animation:pulse 1s ease-in-out infinite;
    ">🚑</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const arrivedAmbIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:26px;height:26px;
      background:#22c55e;
      border:3px solid white;
      border-radius:7px;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      box-shadow:0 0 14px rgba(34,197,94,0.5);
    ">✓</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const patIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;top:-22px;left:50%;transform:translateX(-50%);
        background:#dc2626;color:white;font-size:9px;font-weight:900;
        padding:2px 6px;border-radius:4px;white-space:nowrap;
        box-shadow:0 2px 4px rgba(0,0,0,0.2);
      ">PATIENT</div>
      <div style="
        position:absolute;inset:0;
        background:rgba(220,38,38,0.4);
        border-radius:50%;
        animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:#dc2626;
        border:2px solid white;
        border-radius:50%;
        box-shadow:0 0 15px rgba(220,38,38,1);
        display:flex;align-items:center;justify-content:center;
        font-size:10px;color:white;font-weight:bold;
      ">!</div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hospIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:30px;height:30px;
      background:#2563eb;
      border:2px solid white;
      border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:15px;font-weight:900;
      box-shadow:0 3px 10px rgba(37,99,235,0.4);
      letter-spacing:-0.5px;
    ">H</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const signalIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;
        background:rgba(16,185,129,0.4);
        border-radius:50%;
        animation:ping 1s infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:#10b981;
        border:2px solid white;
        border-radius:50%;
        box-shadow:0 0 10px rgba(16,185,129,1);
        display:flex;align-items:center;justify-content:center;
        font-size:10px;color:white;
      ">🚦</div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapControl({ dispatched, patient, hospital }) {
  const map = useMap();
  const focused = useRef(false);

  useEffect(() => {
    if (dispatched && !focused.current) {
      const bounds = L.latLngBounds([
        dispatched.location,
        patient.location,
        hospital.location
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      focused.current = true;
    }
  }, [dispatched, patient, hospital, map]);

  useEffect(() => {
    if (dispatched) {
      map.panTo(dispatched.location, { animate: true, duration: 0.8 });
    }
  }, [dispatched?.location, map]);

  return null;
}

const trafficColor = {
  Low:    { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  Medium: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  High:   { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
};

// ─── SmoothMarker Wrapper ───────────────────────────────────────────────────
// Uses requestAnimationFrame to interpolate between socket updates for 60FPS
const SmoothMarker = ({ position, icon, children, duration = 450 }) => {
  const markerRef                = useRef(null);
  const [currentPos, setCurrentPos] = useState(position);
  const prevPosRef               = useRef(position);
  const startTimeRef             = useRef(0);

  useEffect(() => {
    prevPosRef.current = currentPos;
    startTimeRef.current = performance.now();
    
    let animId;
    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const lat = prevPosRef.current[0] + (position[0] - prevPosRef.current[0]) * progress;
      const lng = prevPosRef.current[1] + (position[1] - prevPosRef.current[1]) * progress;
      
      const newPos = [lat, lng];
      if (markerRef.current) markerRef.current.setLatLng(newPos);
      setCurrentPos(newPos);

      if (progress < 1) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [position, duration]);

  return (
    <Marker ref={markerRef} position={currentPos} icon={icon} autoPan={false}>
      {children}
    </Marker>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiveResponse() {
  const [sysState, setSysState]       = useState(null);
  const [scanning, setScanning]       = useState(false);
  const [scanStep, setScanStep]       = useState(0);  
  const [pivotFlash, setPivotFlash]   = useState(false);
  const [pivotReason, setPivotReason] = useState('');
  const prevStatus = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = glowStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on('system_update', (data) => {
      if (prevStatus.current !== 'ACTIVE' && data.systemStatus === 'ACTIVE') {
        setScanning(true);
        setScanStep(1);
        setTimeout(() => setScanStep(2), 1500);
        setTimeout(() => { setScanning(false); setScanStep(0); }, 3500);
      }
      prevStatus.current = data.systemStatus;
      setSysState(data);
    });

    socket.on('SYSTEM_PIVOT', (data) => {
      setPivotReason(data.reason);
      setPivotFlash(true);
      setTimeout(() => setPivotFlash(false), 8000);
    });

    return () => {
      socket.off('system_update');
      socket.off('SYSTEM_PIVOT');
      socket.disconnect();
    };
  }, []);

  const handleAccept = async (ambulanceId) => {
    try {
      await fetch('/api/accept-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulanceId })
      });
    } catch (err) {
      console.error('Acceptance failed:', err);
    }
  };

  if (!sysState || sysState.systemStatus === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
        <LocateFixed className="w-16 h-16 opacity-30" />
        <h2 className="text-xl font-bold uppercase tracking-widest">No active response</h2>
        <p className="font-medium">Awaiting dispatch from Decision Engine.</p>
      </div>
    );
  }

  // Phase 1: Manual Dispatch Acceptance (PENDING)
  if (sysState.systemStatus === 'PENDING') {
    const { patient, pendingAmbulanceOffers } = sysState;
    const severityConfig = {
      CRITICAL: { color: 'bg-red-600', icon: 'AlertTriangle', label: 'Critical Alert' },
      MAJOR:    { color: 'bg-amber-600', icon: 'Activity',      label: 'High Priority' },
      STABLE:   { color: 'bg-blue-600',  icon: 'ShieldCheck',   label: 'Stable Report' }
    };
    const config = severityConfig[patient.severity] || severityConfig.STABLE;

    return (
      <div className="flex flex-col h-full items-center justify-center p-6 lg:p-12 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          <div className={`lg:w-1/2 p-10 ${config.color} text-white flex flex-col justify-between transition-colors duration-500`}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <AlertTriangle className="w-8 h-8 text-white" />
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase">{config.label}</h2>
              </div>
              <h3 className="text-5xl font-black mb-4 leading-none">{patient.type}</h3>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-black/20 rounded-xl text-[10px] font-black tracking-[.2em] uppercase border border-white/10">
                   MODALITY: {patient.severity}
                </div>
                <div className="px-4 py-2 bg-white text-gray-900 rounded-xl text-[10px] font-black tracking-widest uppercase">
                   SYS ID: {patient.id}
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/20">
               <div className="flex items-center gap-4">
                  <Activity className="w-8 h-8 opacity-50" />
                  <p className="text-sm font-bold italic tracking-tight">AI triaged best destination: {sysState.hospital?.name}</p>
               </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-10 bg-slate-50 flex flex-col justify-center gap-6">
            <h4 className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-2">Available Responders</h4>
            <div className="flex flex-col gap-4">
              {pendingAmbulanceOffers?.map((amb) => (
                <div key={amb.id} className="group p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-cyan-500 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-inner">
                         🚑
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight leading-none">{amb.id}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          {amb.distanceToPatient} km · {amb.traffic} Traffic
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAccept(amb.id)}
                      className={`px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg`}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Live Tracking (ACTIVE)
  const { patient, ambulances, dispatchedAmbulanceId, hospital, hospitals, routes, activeSignalOverrides } = sysState;
  const dispatched = ambulances?.find(a => a.id === dispatchedAmbulanceId);
  const isCritical = patient.severity === 'CRITICAL';
  const sortedFleet = ambulances ? [...ambulances].sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost)) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* MAP SECTION */}
      <div className="lg:w-[60%] flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            <span className="font-bold text-base tracking-wide uppercase text-gray-800">Mission · {patient.id}</span>
          </div>
          <div className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest ${
            isCritical ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {patient.severity}
          </div>
        </div>

        {scanning && (
          <div className={`rounded-xl p-3 flex items-center gap-3 border animate-in slide-in-from-top ${
            scanStep === 1 ? 'bg-sky-50 border-sky-200' : 'bg-green-50 border-green-200'
          }`}>
            <Radio className="w-4 h-4 animate-pulse text-sky-600" />
            <span className="font-bold text-sm text-sky-800">
              {scanStep === 1 ? 'Unit Locked. Syncing secure channel...' : `✅ Unit ${dispatchedAmbulanceId} Connected`}
            </span>
          </div>
        )}

        <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner z-0">
          <MapContainer center={dispatched ? dispatched.location : patient.location} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MapControl dispatched={dispatched} patient={patient} hospital={hospital} />

            {/* AI Signal Overrides */}
            {activeSignalOverrides?.map((node, i) => (
              <Marker key={`sig-${i}`} position={node} icon={signalIcon} />
            ))}

            {/* AI-Powered A* Routing Visualization with Premium Styling */}
            {routes?.map((route, i) => {
              const isBest = route.isOptimal;
              const color = isBest ? '#00E676' : (i === 1 ? '#FFD700' : '#FF3333');
              const weight = isBest ? 6 : 5;
              const opacity = isBest ? 1.0 : 1.0;
              const dashArray = isBest ? null : '12, 12';
              
              return (
                <React.Fragment key={route.id || i}>
                  {/* Subtle Halo for Best Route */}
                  {isBest && (
                    <Polyline
                      positions={route.coordinates}
                      pathOptions={{
                        color: '#fff',
                        weight: weight + 3,
                        opacity: 0.4,
                        className: 'route-best route-halo'
                      }}
                    />
                  )}
                  {/* Main Route Polyline */}
                  <Polyline
                    positions={route.coordinates}
                    pathOptions={{
                      color: color,
                      weight: weight,
                      opacity: opacity,
                      dashArray: dashArray,
                      className: isBest ? 'route-best' : (i === 1 ? 'route-alt' : 'route-traffic')
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Fleet & Patient */}
            {ambulances?.map(amb => {
              const isDisp = amb.id === dispatchedAmbulanceId;
              const isArrived = amb.status === 'ARRIVED';
              const icon = isArrived ? arrivedAmbIcon : isDisp ? dispatchedAmbIcon : idleAmbIcon;
              const MarkerComp = isDisp && !isArrived ? SmoothMarker : Marker;
              return <MarkerComp key={amb.id} position={amb.location} icon={icon} />;
            })}

            {patient.status !== 'DELIVERED' && (
              <SmoothMarker position={patient.location} icon={patIcon} duration={480} />
            )}

            {/* Clinical Health Grid */}
            {hospitals?.map(h => {
              const isSelected = h.id === hospital?.id;
              const hMarkerIcon = new L.DivIcon({
                className: '',
                html: `<div style="width:30px;height:30px;background:${isSelected ? '#22d3ee' : '#2563eb'};border:2px solid white;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;box-shadow:${isSelected ? '0 0 15px #22d3ee' : 'none'}">H</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });
              return <Marker key={h.id} position={h.location} icon={hMarkerIcon} />;
            })}
          </MapContainer>

          {/* AI Self-Healing Pivot Notification Overlay */}
          {pivotFlash && (
            <div className="absolute bottom-6 left-6 right-6 z-[1000] animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-emerald-400/30 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-pulse" />
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="w-12 h-12 bg-emerald-400/20 rounded-2xl flex items-center justify-center border border-emerald-400/50">
                        <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="px-2 py-0.5 bg-emerald-400 text-slate-900 text-[8px] font-black rounded-md uppercase tracking-tighter">Diagnostic Locked</div>
                           <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">AI Autonomous Pivot</h4>
                        </div>
                        <p className="text-base font-black italic tracking-tighter leading-none mb-1">Vector Re-Optimized to {hospital.name}</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{pivotReason || 'Clinical outcome re-triaged for regional efficiency.'}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* PANELS SECTION */}
      <div className="lg:w-[40%] flex flex-col gap-4 overflow-y-auto pr-2">
        {dispatched && (
          <div className="card bg-white border-l-4 border-l-cyan-500 p-5 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ETA · {dispatched.id}</p>
                   <h2 className="text-4xl font-black">{dispatched.eta || 0}<span className="text-sm ml-1 text-gray-400">sec</span></h2>
                </div>
                <Clock className="w-8 h-8 text-cyan-400" />
             </div>
             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, 100 - (dispatched.eta || 0) * 1.5)}%` }} />
             </div>
          </div>
        )}

        {/* Hospital Card from main branch */}
        {hospital && (
          <div className="card bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Clinical Destination</h3>
             </div>
             <p className="text-xl font-black text-gray-800">{hospital.name}</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{hospital.spec} Specialist Facility</p>
             <div className="mt-4 p-3 bg-indigo-50 rounded-xl text-xs text-indigo-700 italic border-l-2 border-indigo-400">
                "{hospital.selectionReason}"
             </div>
             <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</span>
                <span className="font-black text-base">{hospital.distanceStr}</span>
             </div>
          </div>
        )}

        {/* Vitals Panel */}
        <div className="card bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Bio-Telemetry</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">HR</p>
                 <p className="text-3xl font-black font-mono">{Math.round(patient.vitals.heartRate)}<span className="text-xs"> BPM</span></p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SpO₂</p>
                 <p className="text-3xl font-black font-mono">{Math.round(patient.vitals.oxygen)}<span className="text-xs">%</span></p>
              </div>
           </div>
           <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Status</span>
              <span className="text-sm font-black text-slate-800 capitalize">{patient.status.replace(/_/g, ' ').toLowerCase()}</span>
           </div>
        </div>

        {/* AI Routing Analysis Section */}
        <div className="card bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl overflow-hidden relative border border-white/10 mt-2">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24 text-emerald-400" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                 <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">AI Navigation Hub</h3>
              </div>
              
              <div className="flex items-end justify-between mb-6">
                 <div>
                   <p className="text-[10px] font-bold text-white/40 uppercase mb-1">A* Optimizer Score</p>
                   <p className="text-4xl font-black italic tracking-tighter">F: {routes?.[0]?.fScore || '---'}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Status</p>
                   <p className="text-xs font-black text-emerald-400 uppercase">Optimal Path Locked</p>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Strategy Reasoning</p>
                 <p className="text-xs font-medium text-white/80 leading-relaxed italic">
                   "{routes?.[0]?.aiReason || 'Computing diagnostic urban vectors for medical clearance...'}"
                 </p>
              </div>

              <div className="mt-6 flex gap-2">
                 <div className="flex-1 h-1 bg-emerald-400 rounded-full" />
                 <div className="flex-1 h-1 bg-white/10 rounded-full" />
                 <div className="flex-1 h-1 bg-white/10 rounded-full" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
