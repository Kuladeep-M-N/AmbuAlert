import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { AlertTriangle, Clock, HeartPulse, LocateFixed, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons representing different actors using raw HTML/CSS for simplicity
<<<<<<< HEAD
const ambIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-4 h-4 bg-cyan-500 rounded-sm border border-white shadow-md animate-pulse"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
const patIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-3 h-3 bg-red-600 rounded-full border border-white shadow-md animate-ping"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
const hospIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-6 h-6 bg-indigo-600 rounded-md border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">H</div>', iconSize: [24, 24], iconAnchor: [12, 12] });
=======
const ambIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-6 h-6 bg-white rounded flex items-center justify-center border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] relative z-50"><span class="text-red-500 text-xs font-bold">+</span></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
const patIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(250,204,21,1)] animate-ping relative z-40"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
const hospIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-6 h-6 bg-blue-500 rounded-md border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-30">H</div>', iconSize: [24, 24], iconAnchor: [12, 12] });
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0

function AmbulanceTracker({ location, isDispatched }) {
  const map = useMap();
  useEffect(() => {
    if (location && isDispatched) {
      // Pan to the ambulance location using a smooth 1-second transition
      map.panTo(location, { animate: true, duration: 1.0, easeLinearity: 1 });
    }
  }, [location, map, isDispatched]);
  return null;
}

export default function LiveResponse() {
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
        <LocateFixed className="w-16 h-16 opacity-30" />
        <h2 className="text-xl font-bold uppercase tracking-widest">No active response</h2>
        <p className="font-medium">Awaiting dispatch parameters from Decision Engine.</p>
      </div>
    );
  }

  const { patient, ambulance, hospital, routes } = sysState;
  const isCritical = patient.severity === 'CRITICAL';
  
  // Center map dynamically based on patient location if awaiting, or hospital if in transit
  const mapCenter = patient.status === 'AWAITING_AMBULANCE' 
    ? [patient.location[0], patient.location[1]] 
    : [hospital.location[0], hospital.location[1]];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-full animate-in fade-in duration-500">
      {/* Left: Live GeoMap Tracking */}
      <div className="lg:w-[60%] flex flex-col gap-4">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-md z-10">
           <div className="flex items-center gap-3">
<<<<<<< HEAD
             <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
             <span className="font-bold text-lg tracking-wide uppercase text-gray-800">Live Operation: {patient.id}</span>
           </div>
           <div className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest ${isCritical ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
=======
             <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
             <span className="font-bold text-lg tracking-wide uppercase text-red-100">Live Operation: {patient.id}</span>
           </div>
           <div className={`px-3 py-1 rounded font-bold text-sm shadow-[0_0_10px_currentColor] ${isCritical ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
             {patient.severity} PRIORITY
           </div>
        </div>

<<<<<<< HEAD
        <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-100 relative shadow-inner z-0">
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%', background: '#f3f4f6' }}>
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
=======
        <div className="flex-1 rounded-xl overflow-hidden border-2 border-slate-700 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] z-0">
          <MapContainer center={[ambulance.location[0], ambulance.location[1]]} zoom={15} minZoom={14} maxZoom={17} zoomSnap={0.5} zoomDelta={0.5} bounceAtZoomLimits={false} inertia={true} style={{ height: '100%', width: '100%', background: '#e5e7eb' }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <AmbulanceTracker location={[ambulance.location[0], ambulance.location[1]]} isDispatched={ambulance.status !== 'IDLE'} />
            
            {/* Draw Routes manually using Leaflet Polylines */}
            {routes && [...routes].reverse().map((route, i) => {
              const routeClass = route.isOptimal 
                ? 'route-optimal' 
                : (route.trafficString === 'High' ? 'route-traffic' : 'route-alternative');
              
              const weightConfig = route.isOptimal ? 8 : (route.trafficString === 'High' ? 3 : 5);

              return (
                <Polyline
                  key={route.id || i}
                  positions={route.coordinates}
                  pathOptions={{
                    className: routeClass,
                    color: route.color, 
                    weight: weightConfig,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )
            })}
            
            {patient.status !== 'DELIVERED' && (
              <Marker position={[patient.location[0], patient.location[1]]} icon={patIcon}>
<<<<<<< HEAD
                <Popup className="font-bold">Patient {patient.id}</Popup>
=======
                <Popup autoPan={false} className="text-slate-800 font-bold">Patient {patient.id}</Popup>
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
              </Marker>
            )}
            
            <Marker position={[ambulance.location[0], ambulance.location[1]]} icon={ambIcon}>
<<<<<<< HEAD
              <Popup className="font-bold text-cyan-600">AMB: {ambulance.id}</Popup>
=======
              <Popup autoPan={false} className="text-slate-800 font-bold">AMB: {ambulance.id}</Popup>
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
            </Marker>
            
            <Marker position={[hospital.location[0], hospital.location[1]]} icon={hospIcon}>
<<<<<<< HEAD
              <Popup className="font-bold text-indigo-700">{hospital.name}</Popup>
=======
              <Popup autoPan={false} className="text-slate-800 font-bold">{hospital.name}</Popup>
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Right: Telemetry & Traffic */}
      <div className="lg:w-[40%] flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        
<<<<<<< HEAD
        {/* ETA Widget */}
        <div className="card bg-white border-l-4 border-l-cyan-500 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Est. Arrival Time</p>
              <h2 className="text-4xl font-black font-mono mt-1 text-gray-800">{ambulance.eta} <span className="text-lg text-gray-400">sec</span></h2>
            </div>
            <Clock className="w-8 h-8 text-cyan-500 opacity-40 hover:opacity-100 transition-opacity" />
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
             <div className="bg-cyan-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.3)]" style={{ width: `${Math.min(100, Math.max(0, 100 - (ambulance.eta * 2)))}%` }}></div>
=======
        {/* Route Decision Panel */}
        <div className="card shadow-xl bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <Navigation className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold tracking-widest uppercase">AI Route Engine</h3>
          </div>
          <div className="flex flex-col gap-3 relative">
            {routes && routes.map((route, idx) => (
              <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 ${route.isOptimal ? 'border-green-500/50 bg-green-500/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.15)] transform hover:scale-[1.02]' : 'border-slate-800 bg-slate-800/50 opacity-80'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white flex items-center gap-3 text-lg">
                    <div className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: route.color }}></div>
                    Route {idx + 1} {route.isOptimal && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full ml-1 animate-pulse">BEST</span>}
                  </span>
                  <span className="font-mono font-bold text-2xl text-slate-100">{route.etaMinutes} <span className="text-sm">min</span></span>
                </div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest mt-3">
                  <span className="text-slate-400 bg-slate-800 px-2 py-1 rounded">{route.distanceStr}</span>
                  <span className={`px-2 py-1 rounded ${route.trafficString === 'High' ? 'bg-red-500/20 text-red-400' : route.trafficString === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    Traffic: {route.trafficString}
                  </span>
                </div>
              </div>
            ))}
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
          </div>
        </div>

        {/* Hospital Decision Panel */}
        <div className="card shadow-xl bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
             <h3 className="font-bold tracking-widest uppercase text-blue-400">Hospital Match</h3>
          </div>
          <div className="flex flex-col text-white">
             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">{hospital.name}</span>
             <span className="text-sm text-slate-400 mt-1 uppercase font-semibold">{hospital.spec} SPECIALIZATION</span>
             
             <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mt-3 text-sm text-slate-300 italic border-l-4 border-l-blue-500">
               "{hospital.selectionReason || 'Nearest General Facility AI Match'}"
             </div>

             <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-500">Distance</span>
                <span className="font-mono font-bold text-lg text-slate-200">{hospital.distanceStr || "2.1 km"}</span>
             </div>
          </div>
        </div>

        {/* ETA Widget */}
        <div className="flex gap-4">
            <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-l-4 border-l-blue-500 shadow-lg flex-1 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Active ETA</p>
                  <h2 className="text-3xl font-bold font-mono mt-1">{Math.ceil(ambulance.eta / 60)} <span className="text-sm text-slate-500">mins</span></h2>
                </div>
                <Clock className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-blue-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_#3b82f6]" style={{ width: `${Math.max(5, 100 - ((ambulance.eta/1500) * 100))}%` }}></div>
              </div>
            </div>

            {/* Status Snapshot */}
            <div className="card bg-slate-900 border border-slate-700 flex-1 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Mission Status</p>
                <p className="text-lg font-bold text-white capitalize">{patient.status.replace('_', ' ').toLowerCase()}</p>
            </div>
        </div>

        {/* Vitals Telemetry */}
<<<<<<< HEAD
        <div className="card flex-1 shadow-md border-gray-200">
          <div className="flex items-center gap-2 mb-6 text-gray-600">
            <HeartPulse className="w-5 h-5 text-red-600 animate-pulse" />
            <h3 className="font-bold tracking-widest uppercase text-sm">Medical Twin Vitals</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border transition-all ${patient.vitals.heartRate > 120 || patient.vitals.heartRate < 60 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
              <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-widest">Heart Rate</p>
              <p className="text-3xl font-black font-mono">{Math.round(patient.vitals.heartRate)} <span className="text-xs font-sans">BPM</span></p>
            </div>
            <div className={`p-4 rounded-xl border transition-all ${patient.vitals.oxygen < 92 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
              <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-widest">SpO2 Level</p>
              <p className="text-3xl font-black font-mono">{Math.round(patient.vitals.oxygen)}<span className="text-xs font-sans">%</span></p>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
             <div>
                 <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Transport Status</p>
                 <p className="text-md font-bold text-gray-800 capitalize">{patient.status.replace('_', ' ').toLowerCase()}</p>
             </div>
             <div className="text-right text-[10px] font-mono text-gray-400">
                <p>LAT: {ambulance.location[0].toFixed(5)}</p>
                <p>LNG: {ambulance.location[1].toFixed(5)}</p>
             </div>
          </div>
        </div>

        {/* Traffic Node Warning */}
        {isCritical && (
          <div className="card border-orange-200 bg-orange-50 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/0 via-orange-200/20 to-orange-200/0 animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="flex items-start gap-3 relative z-10">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-bold text-orange-800 uppercase tracking-wide text-xs">Smart City Node: Clearance Active</h4>
                <p className="text-xs text-orange-700/80 mt-1 font-medium italic">
                  Traffic signals overridden for critical route vector.
                </p>
              </div>
            </div>
          </div>
        )}

=======
        <div className="card shadow-lg bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-bold tracking-wide">Patient Vitals</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border transition-colors ${patient.vitals.heartRate > 120 || patient.vitals.heartRate < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
              <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-widest">Heart Rate</p>
              <p className="text-3xl font-bold font-mono">{Math.round(patient.vitals.heartRate)} <span className="text-xs font-sans">BPM</span></p>
            </div>
            <div className={`p-4 rounded-xl border transition-colors ${patient.vitals.oxygen < 92 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
              <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-widest">SpO2 Level</p>
              <p className="text-3xl font-bold font-mono">{Math.round(patient.vitals.oxygen)}<span className="text-xs font-sans">%</span></p>
            </div>
          </div>
        </div>
>>>>>>> 94b7abe3abd775e4231df03ebe20ed9779a931b0
      </div>
    </div>
  );
}
