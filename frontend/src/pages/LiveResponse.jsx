import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import {
  AlertTriangle, Clock, HeartPulse, LocateFixed,
  Radio, Zap, CheckCircle, Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

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
    if (dispatched && dispatched.status !== 'ARRIVED') {
      map.panTo(dispatched.location, { animate: true, duration: 0.8 });
    }
  }, [dispatched?.location, map]);

  return null;
}

// ─── Traffic badge colors ─────────────────────────────────────────────────────

const trafficColor = {
  Low:    { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  Medium: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  High:   { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiveResponse() {
  const [sysState, setSysState]       = useState(null);
  const [scanning, setScanning]       = useState(false);
  const [scanStep, setScanStep]       = useState(0);  // 0=off 1=scanning 2=found
  const prevStatus = useRef(null);

  useEffect(() => {
    socket.on('system_update', (data) => {
      if (prevStatus.current !== 'ACTIVE' && data.systemStatus === 'ACTIVE') {
        // Uber-style: quick scan animation then "found" state
        setScanning(true);
        setScanStep(1);
        setTimeout(() => setScanStep(2), 1800);
        setTimeout(() => { setScanning(false); setScanStep(0); }, 4000);
      }
      prevStatus.current = data.systemStatus;
      setSysState(data);
    });
    return () => socket.off('system_update');
  }, []);

  // ── IDLE state ──────────────────────────────────────────────────────────────
  if (!sysState || sysState.systemStatus !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
        <LocateFixed className="w-16 h-16 opacity-30" />
        <h2 className="text-xl font-bold uppercase tracking-widest">No active response</h2>
        <p className="font-medium">Awaiting dispatch from Decision Engine.</p>
      </div>
    );
  }

  const { patient, ambulances, dispatchedAmbulanceId, hospital, routes } = sysState;
  const dispatched = ambulances?.find(a => a.id === dispatchedAmbulanceId);
  const isCritical = patient.severity === 'CRITICAL';

  const sortedFleet = ambulances
    ? [...ambulances].sort((a, b) => a.cost - b.cost)
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">

      {/* ════ LEFT — MAP ════════════════════════════════════════════════════ */}
      <div className="lg:w-[60%] flex flex-col gap-3 h-full">

        {/* Header bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            <span className="font-bold text-base tracking-wide uppercase text-gray-800">
              Live Op · {patient.id}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest ${
            isCritical
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-amber-100 text-amber-700 border border-amber-200'
          }`}>
            {patient.severity} PRIORITY
          </div>
        </div>

        {/* Uber-style scan banner */}
        {scanning && (
          <div className={`rounded-xl p-3 flex items-center gap-3 border transition-all duration-500 ${
            scanStep === 1
              ? 'bg-sky-50 border-sky-200 text-sky-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {scanStep === 1 ? (
              <>
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="font-bold text-sm">
                  Scanning nearby fleet — calculating optimal dispatch…
                </span>
                <span className="ml-auto flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="font-bold text-sm">
                  ✅ {dispatchedAmbulanceId} dispatched — lowest cost score wins
                </span>
              </>
            )}
          </div>
        )}

        {/* MAP — fills remaining height */}
        <div
          className="flex-1 rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner z-0"
          style={{ minHeight: '0' }}
        >
          <MapContainer
            center={dispatched ? dispatched.location : patient.location}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* Mission Framing & Smooth Follow */}
            <MapControl dispatched={dispatched} patient={patient} hospital={hospital} />

            {/* Routes */}
            {routes && [...routes].reverse().map((route, i) => {
              // Red for heading to patient, Blue for heading to hospital
              const phaseRouteColor = patient.status === 'AWAITING_AMBULANCE' 
                ? (route.isOptimal ? '#ef4444' : '#f87171') // RED tones
                : (route.isOptimal ? '#3b82f6' : '#60a5fa'); // BLUE tones

              return (
                <Polyline
                  key={route.id || i}
                  positions={route.coordinates}
                  pathOptions={{
                    className: route.isOptimal ? 'route-optimal' : (route.trafficString === 'High' ? 'route-traffic' : 'route-alternative'),
                    color:     phaseRouteColor,
                    weight:    route.isOptimal ? 8 : 4,
                    lineCap:   'round',
                    lineJoin:  'round',
                  }}
                />
              );
            })}

            {/* All 5 ambulances */}
            {ambulances && ambulances.map(amb => {
              const isDisp    = amb.id === dispatchedAmbulanceId;
              const isArrived = amb.status === 'ARRIVED';
              const icon      = isArrived ? arrivedAmbIcon : isDisp ? dispatchedAmbIcon : idleAmbIcon;
              const tc        = trafficColor[amb.traffic] || trafficColor.Medium;

              return (
                <Marker key={amb.id} position={amb.location} icon={icon} autoPan={false}>
                  <Popup autoPan={false}>
                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
                      <p style={{ fontWeight: 900, fontSize: '13px', marginBottom: '4px' }}>
                        {amb.id} · {amb.crew}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>{amb.zone}</p>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isDisp ? '#0ea5e9' : '#e5e7eb',
                        color: isDisp ? 'white' : '#374151',
                        fontSize: '10px', fontWeight: 700,
                      }}>
                        {isArrived ? '✓ ARRIVED' : isDisp ? '🟢 DISPATCHED' : '⚪ STANDBY'}
                      </span>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#374151' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Distance</span><strong>{amb.distanceToPatient} km</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Traffic</span>
                          <strong style={{ color: tc.text }}>{amb.traffic}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Cost score</span><strong style={{ color: isDisp ? '#0ea5e9' : '#374151' }}>{amb.cost}</strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Patient */}
            {patient.status !== 'DELIVERED' && (
              <Marker position={patient.location} icon={patIcon} autoPan={false}>
                <Popup autoPan={false}><strong>🆘 Patient {patient.id}</strong><br />{patient.type} · {patient.severity}</Popup>
              </Marker>
            )}

            {/* Hospital */}
            <Marker position={hospital.location} icon={hospIcon} autoPan={false}>
              <Popup autoPan={false}><strong>{hospital.name}</strong><br />{hospital.spec} Centre</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* ════ RIGHT — PANELS ════════════════════════════════════════════════ */}
      <div className="lg:w-[40%] flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '100%' }}>

        {/* ETA counter */}
        {dispatched && (
          <div className="card bg-white border-l-4 border-l-cyan-500 shadow-md p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Est. Arrival · {dispatched.id}
                </p>
                <h2 className="text-4xl font-black font-mono text-gray-800">
                  {dispatched.eta || 0}
                  <span className="text-base text-gray-400 ml-1 font-sans font-semibold">sec</span>
                </h2>
              </div>
              <Clock className="w-7 h-7 text-cyan-400 mt-1" />
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                style={{ width: `${Math.min(100, Math.max(2, 100 - (dispatched.eta || 0) * 1.5))}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
              <span>DISPATCHED</span>
              <span>{patient.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}

        {/* ── Fleet Dispatch Panel — Uber/Rapido style ────────────────────── */}
        <div className="card shadow-md bg-white border border-gray-100 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <h3 className="font-black text-xs uppercase tracking-widest text-cyan-600">
                Smart Fleet Dispatch
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">
              {ambulances?.length || 0} units · 1 dispatched
            </span>
          </div>

          {/* Fleet list sorted by cost */}
          <div className="flex flex-col gap-2">
            {sortedFleet.map((amb, idx) => {
              const isDisp    = amb.id === dispatchedAmbulanceId;
              const isArrived = amb.status === 'ARRIVED';
              const tc        = trafficColor[amb.traffic] || trafficColor.Medium;

              return (
                <div
                  key={amb.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isDisp
                      ? 'bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-300 shadow-[0_0_16px_rgba(14,165,233,0.18)]'
                      : 'bg-gray-50 border-gray-100 opacity-70'
                  }`}
                >
                  {/* Ambulance avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 flex-shrink-0 ${
                    isArrived
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : isDisp
                      ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_12px_rgba(14,165,233,0.5)]'
                      : 'bg-gray-100 border-gray-200'
                  }`}>
                    {isArrived ? '✓' : '🚑'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-sm text-gray-800">{amb.id}</span>
                      <span className="text-[9px] text-gray-400 font-medium">{amb.crew}</span>
                      {isDisp && !isArrived && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-cyan-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                          <Zap className="w-2.5 h-2.5" />DISPATCHED
                        </span>
                      )}
                      {isArrived && (
                        <span className="px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                          ARRIVED
                        </span>
                      )}
                      {!isDisp && !isArrived && idx === 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                          BEST ALT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-gray-500">{amb.distanceToPatient} km</span>
                      <span className="text-gray-300 text-[10px]">·</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}
                      >
                        {amb.traffic}
                      </span>
                      <span className="text-gray-300 text-[10px]">·</span>
                      <span className="text-[10px] text-gray-400 font-mono">{amb.zone}</span>
                    </div>
                  </div>

                  {/* Cost score */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none mb-0.5">
                      Score
                    </p>
                    <p className={`font-black text-base font-mono leading-none ${
                      isDisp ? 'text-cyan-600' : 'text-gray-400'
                    }`}>
                      {amb.cost}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cost formula legend */}
          <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3 h-3 text-cyan-500" />
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Dispatch Algorithm</p>
            </div>
            <p className="text-[11px] font-mono text-gray-700 font-medium">
              cost = dist_km + traffic_weight × 0.15
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              → Lowest cost unit auto-selected. Others remain on standby.
            </p>
          </div>
        </div>

        {/* Hospital match */}
        <div className="card shadow-md bg-white border border-gray-100 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
            <h3 className="font-bold tracking-widest uppercase text-xs text-indigo-600">Destination Hospital</h3>
          </div>
          <p className="text-xl font-black text-gray-800">{hospital.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-black tracking-widest">{hospital.spec} Specialization</p>
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mt-3 text-xs text-gray-600 italic border-l-4 border-l-indigo-400">
            "{hospital.selectionReason || 'Nearest General Facility AI Match'}"
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Distance</span>
            <span className="font-mono font-black text-lg text-gray-800">{hospital.distanceStr || '—'}</span>
          </div>
        </div>

        {/* Vitals */}
        <div className="card shadow-md border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
            <h3 className="font-bold tracking-widest uppercase text-xs text-gray-600">Patient Vitals</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border transition-all ${
              patient.vitals.heartRate > 120 || patient.vitals.heartRate < 60
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-gray-50 border-gray-100 text-gray-800'
            }`}>
              <p className="text-[9px] font-bold mb-1 opacity-60 uppercase tracking-widest">Heart Rate</p>
              <p className="text-3xl font-black font-mono">
                {Math.round(patient.vitals.heartRate)}
                <span className="text-xs font-sans"> BPM</span>
              </p>
            </div>
            <div className={`p-3 rounded-xl border transition-all ${
              patient.vitals.oxygen < 92
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-gray-50 border-gray-100 text-gray-800'
            }`}>
              <p className="text-[9px] font-bold mb-1 opacity-60 uppercase tracking-widest">SpO₂</p>
              <p className="text-3xl font-black font-mono">
                {Math.round(patient.vitals.oxygen)}
                <span className="text-xs font-sans">%</span>
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-gray-400 mb-0.5 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-gray-800 capitalize">
                {patient.status.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
            {dispatched && (
              <div className="text-right text-[9px] font-mono text-gray-400">
                <p>LAT {dispatched.location[0].toFixed(5)}</p>
                <p>LNG {dispatched.location[1].toFixed(5)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical alert */}
        {isCritical && (
          <div className="card border-orange-200 bg-orange-50 shadow-sm relative overflow-hidden p-4 rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/0 via-orange-200/20 to-orange-200/0 animate-pulse" />
            <div className="flex items-start gap-3 relative z-10">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-800 text-[9px] uppercase tracking-widest mb-1">
                  Smart City Node · Clearance Active
                </h4>
                <p className="text-xs text-orange-700/80 font-medium italic">
                  Traffic signals overridden on critical route vector.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
