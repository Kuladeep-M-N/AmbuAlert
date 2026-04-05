import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  Heart,
  MoveUpRight,
  ShieldCheck,
  Stethoscope,
  Users,
  Waves,
  XCircle
} from 'lucide-react';
import { socket } from '../socket';

const inferClinicalNeed = (type = '') => {
  const value = type.toUpperCase();
  if (value.includes('HEART') || value.includes('CHEST') || value.includes('V-FIB')) return 'CARDIAC';
  if (value.includes('ACCIDENT') || value.includes('COLLISION') || value.includes('FALL')) return 'TRAUMA';
  if (value.includes('PEDIATRIC') || value.includes('CHILD')) return 'PEDIATRIC';
  if (value.includes('FIRE') || value.includes('BURN')) return 'BURN';
  return 'GENERAL';
};

const severityTone = {
  CRITICAL: {
    badge: 'bg-rose-600 text-white border-rose-700',
    panel: 'bg-rose-50 border-rose-200 text-rose-700',
    label: 'Resuscitation Priority'
  },
  MAJOR: {
    badge: 'bg-amber-500 text-white border-amber-600',
    panel: 'bg-amber-50 border-amber-200 text-amber-700',
    label: 'High Priority Trauma'
  },
  ROUTINE: {
    badge: 'bg-sky-600 text-white border-sky-700',
    panel: 'bg-sky-50 border-sky-200 text-sky-700',
    label: 'Standard Triage'
  }
};

const phaseLabel = {
  PENDING: 'Pre-Alert',
  DISPATCHED: 'Unit Dispatched',
  PICKUP: 'Patient Boarding',
  IN_AMBULANCE: 'Patient Onboard',
  IN_TRANSIT: 'Inbound to Facility',
  ARRIVED: 'Arrived',
  DELIVERED: 'Handoff Completed'
};

const HospitalHub = () => {
  const [sysState, setSysState] = useState(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  useEffect(() => {
    let mounted = true;

    const bootstrapStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error('status endpoint unavailable');
        const current = await response.json();
        if (mounted) setSysState(current);
      } catch (err) {
        console.warn('HospitalHub bootstrap status fetch failed:', err?.message || err);
      } finally {
        if (mounted) setIsBootstrapped(true);
      }
    };

    if (!socket.connected) socket.connect();

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);
    const onSystemUpdate = (state) => setSysState(state);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('system_update', onSystemUpdate);

    bootstrapStatus();

    return () => {
      mounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('system_update', onSystemUpdate);
    };
  }, []);

  const {
    patient,
    hospital,
    ambulances = [],
    dispatchedAmbulanceId,
    pendingAmbulanceOffers = [],
    activeSignalOverrides = [],
    systemStatus,
    lastCompletedCase,
    lastUpdated
  } = sysState || {};

  const dispatched = ambulances.find((a) => a.id === dispatchedAmbulanceId);
  const severity = patient?.severity || 'ROUTINE';
  const tone = severityTone[severity] || severityTone.ROUTINE;
  const inferredNeed = inferClinicalNeed(patient?.type);
  const isSpecMismatch = hospital?.spec && inferredNeed !== hospital.spec;
  const capacityPct = hospital?.totalBeds ? Math.round((hospital.availableBeds / hospital.totalBeds) * 100) : null;

  const stage = useMemo(() => {
    if (!isBootstrapped && !sysState) return 'CONNECTING';
    if (!sysState) return 'STANDBY';
    if (systemStatus === 'IDLE') return 'STANDBY';
    if (systemStatus === 'PENDING') return 'PRE_ALERT';
    if (!patient || !hospital) return 'STANDBY';
    if (patient.status === 'DELIVERED' || dispatched?.status === 'ARRIVED' || dispatched?.phase === 'ARRIVED') {
      return 'HANDOFF';
    }
    return 'INBOUND';
  }, [isBootstrapped, sysState, systemStatus, patient, hospital, dispatched]);

  const operationalChecklist = useMemo(() => {
    const critical = severity === 'CRITICAL';
    const trauma = inferredNeed === 'TRAUMA' || severity === 'MAJOR';
    return [
      { label: 'Resus Bay Prepared', ready: critical || severity === 'MAJOR' },
      { label: 'ICU Bed Reserved', ready: (hospital?.availableBeds || 0) > 0 },
      { label: 'Trauma Team Alerted', ready: trauma },
      { label: 'Blood & Crossmatch', ready: critical },
      { label: 'Imaging Room Standby', ready: true }
    ];
  }, [severity, inferredNeed, hospital?.availableBeds]);

  const livePhaseText = phaseLabel[patient?.status] || phaseLabel[dispatched?.phase] || 'Live';
  const liveBannerText = patient?.status === 'IN_AMBULANCE'
    ? 'Patient Received By Ambulance'
    : stage === 'HANDOFF'
      ? 'Patient Arrived'
      : 'Inbound Patient Telemetry';

  if (stage === 'CONNECTING') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium animate-pulse">Connecting to Emergency Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-hidden flex flex-col p-6 font-sans">
      <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-cyan-700 rounded-xl flex items-center justify-center text-white">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hospital Hub</h1>
            <p className="text-gray-500 text-sm font-semibold">Patient-Centric Intake and Handoff</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network</p>
          {isSocketConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase">Online</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-xs font-bold uppercase">Reconnecting</span>
            </div>
          )}
          {lastUpdated && (
            <p className="text-[10px] text-gray-400 font-semibold mt-2">Updated {new Date(lastUpdated).toLocaleTimeString()}</p>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-4 flex flex-col gap-6 min-h-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users size={14} className="text-cyan-500" /> Active Facility
            </h2>

            {hospital ? (
              <div className="space-y-4">
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                  <p className="text-lg font-black text-cyan-900 leading-tight">{hospital.name}</p>
                  <p className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider mt-1">{hospital.spec} specialist</p>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bed Capacity</p>
                    {capacityPct !== null && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                        {capacityPct}% available
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-2">{hospital.availableBeds ?? '-'} / {hospital.totalBeds ?? '-'}</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(0, Math.min(100, capacityPct || 0))}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                  {hospital.selectionReason || 'Routing engine selected this facility for fastest clinically matched care.'}
                </div>

                {isSpecMismatch && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Clinical mismatch detected: patient appears to need {inferredNeed}, destination specialty is {hospital.spec}.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                No facility selected yet.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-y-auto min-h-0">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Intake Checklist
            </h3>
            <div className="space-y-3">
              {operationalChecklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  {item.ready ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-black uppercase">
                      <CheckCircle2 size={14} /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-black uppercase">
                      <XCircle size={14} /> Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-0">
          {stage === 'STANDBY' && (
            <div className="h-full flex flex-col p-12 text-center overflow-y-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Activity size={44} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-500 uppercase tracking-tight">No Active Emergency</h3>
              <p className="text-gray-400 max-w-md mt-2 font-medium mx-auto">
                System is monitoring city telemetry. Hospital intake teams remain in ready state for next dispatch.
              </p>

              <div className="max-w-xl w-full mx-auto mt-8 text-left">
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Last Completed Case</p>

                  {!lastCompletedCase ? (
                    <p className="text-sm text-gray-500">No completed case in current session yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</p>
                        <p className="font-semibold text-gray-800">{lastCompletedCase.patientId} · {lastCompletedCase.type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Severity</p>
                        <p className="font-semibold text-gray-800">{lastCompletedCase.severity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</p>
                        <p className="font-semibold text-gray-800">{lastCompletedCase.hospitalName} ({lastCompletedCase.hospitalSpec})</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transport Unit</p>
                        <p className="font-semibold text-gray-800">{lastCompletedCase.ambulanceId}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivered At</p>
                        <p className="font-semibold text-gray-800">{new Date(lastCompletedCase.deliveredAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {stage === 'PRE_ALERT' && (
            <div className="h-full flex flex-col p-8 gap-6 overflow-y-auto">
              <div className={`rounded-2xl border p-4 ${tone.panel}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="font-black uppercase tracking-wider text-xs">Pre-Alert Received</p>
                  </div>
                  <span className="text-[10px] font-black uppercase">{phaseLabel.PENDING}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Patient</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{patient?.id || 'Pending ID'}</p>
                  <p className="text-sm font-semibold text-gray-600 mt-2">{patient?.type || 'Emergency Case'}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Responder Candidates</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{pendingAmbulanceOffers.length}</p>
                  <p className="text-sm font-semibold text-gray-600 mt-2">Awaiting dispatcher acceptance</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Immediate Preparation</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {tone.label}. Prepare intake team, notify emergency physician, and keep bed assignment warm for rapid handoff.
                </p>
              </div>
            </div>
          )}

          {(stage === 'INBOUND' || stage === 'HANDOFF') && (
            <div className="h-full flex flex-col min-h-0">
              <div className={`p-4 border-b ${tone.panel}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Waves size={18} className="animate-pulse" />
                    <span className="font-black uppercase tracking-widest text-xs">
                      {liveBannerText}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-md border text-[10px] font-black uppercase ${tone.badge}`}>
                    {livePhaseText}
                  </span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6 overflow-y-auto">
                <div className="col-span-2 md:col-span-1 p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patient Profile</p>
                  <p className="text-3xl font-black text-gray-900">{patient?.id || 'Unknown'}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-600">{patient?.type || 'Emergency'}</p>
                  <div className="mt-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-md border text-[10px] font-black uppercase ${tone.badge}`}>
                      {severity}
                    </span>
                    <span className="px-2 py-1 rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase">
                      Need: {inferredNeed}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transport Unit</p>
                  <p className="text-3xl font-black text-gray-900">{dispatched?.id || 'Not Assigned'}</p>
                  <div className="mt-3 flex items-center gap-3 text-gray-600">
                    <Clock size={16} className="text-cyan-600" />
                    <span className="text-sm font-semibold">ETA {Math.max(0, Math.ceil((dispatched?.eta || 0) / 60))} min</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-gray-600">
                    <MoveUpRight size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold">Signal overrides: {activeSignalOverrides.length}</span>
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-rose-600 mb-1">
                      <Heart size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Heart Rate</p>
                    </div>
                    <p className="text-2xl font-black text-rose-700">{Math.round(patient?.vitals?.heartRate || 0)} BPM</p>
                  </div>

                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-sky-600 mb-1">
                      <Activity size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">SpO2</p>
                    </div>
                    <p className="text-2xl font-black text-sky-700">{Math.round(patient?.vitals?.oxygen || 0)}%</p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <BedDouble size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Patient Status</p>
                    </div>
                    <p className="text-base font-black text-emerald-700 uppercase">
                      {(patient?.status || 'UNKNOWN').replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 p-5 rounded-2xl border border-gray-100 bg-white">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Clinical Recommendation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stage === 'HANDOFF'
                      ? 'Patient handoff completed. Move case to treatment workflow and refresh bed availability.'
                      : `Maintain ${tone.label.toLowerCase()}. Keep receiving team at bay entrance and prepare immediate transfer protocol on arrival.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalHub;
