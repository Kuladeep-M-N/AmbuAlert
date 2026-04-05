import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { AlertTriangle, Clock, HeartPulse, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons representing different actors using raw HTML/CSS for simplicity
const ambIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-4 h-4 bg-cyan-500 rounded-sm border border-white shadow-md animate-pulse"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
const patIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-3 h-3 bg-red-600 rounded-full border border-white shadow-md animate-ping"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
const hospIcon = new L.divIcon({ className: 'custom-icon', html: '<div class="w-6 h-6 bg-indigo-600 rounded-md border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">H</div>', iconSize: [24, 24], iconAnchor: [12, 12] });

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
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
        <LocateFixed className="w-16 h-16 opacity-30" />
        <h2 className="text-xl font-bold uppercase tracking-widest">No active response</h2>
        <p className="font-medium">Awaiting dispatch parameters from Decision Engine.</p>
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
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-md z-10">
           <div className="flex items-center gap-3">
             <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
             <span className="font-bold text-lg tracking-wide uppercase text-gray-800">Live Operation: {patient.id}</span>
           </div>
           <div className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest ${isCritical ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
             {patient.severity} PRIORITY
           </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-100 relative shadow-inner z-0">
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%', background: '#f3f4f6' }}>
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MapCenterUpdater center={mapCenter} />
            
            {patient.status !== 'DELIVERED' && (
              <Marker position={[patient.location[0], patient.location[1]]} icon={patIcon}>
                <Popup className="font-bold">Patient {patient.id}</Popup>
              </Marker>
            )}
            <Marker position={[ambulance.location[0], ambulance.location[1]]} icon={ambIcon}>
              <Popup className="font-bold text-cyan-600">AMB: {ambulance.id}</Popup>
            </Marker>
            <Marker position={[hospital.location[0], hospital.location[1]]} icon={hospIcon}>
              <Popup className="font-bold text-indigo-700">{hospital.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Right: Telemetry & Traffic */}
      <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        
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
          </div>
        </div>

        {/* Vitals Telemetry */}
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

      </div>
    </div>
  );
}
