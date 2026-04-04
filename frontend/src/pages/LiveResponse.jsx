import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { AlertTriangle, Clock, HeartPulse, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons representing different actors using raw HTML/CSS for simplicity
const ambIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-4 h-4 bg-yellow-400 rounded-sm border border-white shadow-lg animate-pulse"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
const patIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-3 h-3 bg-red-500 rounded-full border border-white shadow-lg animate-ping"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
const hospIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-6 h-6 bg-blue-500 rounded-md border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">H</div>', iconSize: [24, 24], iconAnchor: [12, 12] });

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
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
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
        <LocateFixed className="w-16 h-16 opacity-50" />
        <h2 className="text-xl font-bold">No active response</h2>
        <p>Awaiting dispatch parameters from Decision Engine.</p>
      </div>
    );
  }

  const { patient, ambulance, hospital } = sysState;
  const isCritical = patient.severity === 'CRITICAL';
  
  // Center map on ambulance currently
  const mapCenter = [ambulance.location[0], ambulance.location[1]];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-full animate-in fade-in duration-500">
      {/* Left: Live GeoMap Tracking */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md z-10">
           <div className="flex items-center gap-3">
             <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
             <span className="font-bold text-lg tracking-wide uppercase text-red-100">Live Operation: {patient.id}</span>
           </div>
           <div className={`px-3 py-1 rounded font-bold text-sm ${isCritical ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
             {patient.severity} PRIORITY
           </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border-2 border-slate-700 relative shadow-2xl z-0">
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapCenterUpdater center={mapCenter} />
            
            {patient.status !== 'DELIVERED' && (
              <Marker position={[patient.location[0], patient.location[1]]} icon={patIcon}>
                <Popup className="text-slate-800 font-bold">Patient {patient.id}</Popup>
              </Marker>
            )}
            <Marker position={[ambulance.location[0], ambulance.location[1]]} icon={ambIcon}>
              <Popup className="text-slate-800 font-bold">AMB: {ambulance.id}</Popup>
            </Marker>
            <Marker position={[hospital.location[0], hospital.location[1]]} icon={hospIcon}>
              <Popup className="text-slate-800 font-bold">{hospital.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Right: Telemetry & Traffic */}
      <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        
        {/* ETA Widget */}
        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-l-4 border-l-blue-500 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Estimated Time of Arrival</p>
              <h2 className="text-4xl font-bold font-mono mt-1">{ambulance.eta} <span className="text-lg text-slate-500">sec</span></h2>
            </div>
            <Clock className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_#3b82f6]" style={{ width: `${Math.min(100, Math.max(0, 100 - (ambulance.eta * 2)))}%` }}></div>
          </div>
        </div>

        {/* Vitals Telemetry */}
        <div className="card flex-1 shadow-lg">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-bold tracking-wide">Digital Twin Vitals</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${patient.vitals.heartRate > 120 || patient.vitals.heartRate < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
              <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-widest">Heart Rate</p>
              <p className="text-3xl font-bold font-mono">{Math.round(patient.vitals.heartRate)} <span className="text-xs font-sans">BPM</span></p>
            </div>
            <div className={`p-4 rounded-xl border ${patient.vitals.oxygen < 92 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
              <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-widest">SpO2 Level</p>
              <p className="text-3xl font-bold font-mono">{Math.round(patient.vitals.oxygen)}<span className="text-xs font-sans">%</span></p>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
             <div>
                 <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Mission Status</p>
                 <p className="text-lg font-bold text-white capitalize">{patient.status.replace('_', ' ').toLowerCase()}</p>
             </div>
             <div className="text-right text-xs font-mono text-slate-500">
                <p>Lat: {ambulance.location[0].toFixed(5)}</p>
                <p>Lng: {ambulance.location[1].toFixed(5)}</p>
             </div>
          </div>
        </div>

        {/* Traffic Node Warning */}
        {isCritical && (
          <div className="card border-orange-500/30 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="flex items-start gap-3 relative z-10">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
              <div>
                <h4 className="font-bold text-orange-400">Smart City Traffic Notified</h4>
                <p className="text-sm text-orange-300/70 mt-1">
                  Transmitting CRITICAL route vectors. Priority clearances active at intersections.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
