import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Watch, Car, HeartPulse, Activity } from 'lucide-react';

export default function EmergencyInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const triggerEmergency = async (payload) => {
    setLoading(true);
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setTimeout(() => navigate('/app/live'), 600);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const submitManual = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    triggerEmergency({
      type: formData.get('symptoms'),
      age: formData.get('age'),
      impact: 0,
      no_movement: false
    });
  };

  const quickTriggers = [
    {
      id: 'watch-vfib',
      title: 'Smartwatch Sync: V-Fib',
      subtitle: 'Detected irregular heartbeat patterns',
      icon: Watch,
      iconClass: 'text-rose-600 bg-rose-50',
      hoverClass: 'hover:border-rose-200 hover:bg-rose-50/50',
      payload: { type: 'Heart Attack', impact: 0, no_movement: false }
    },
    {
      id: 'vehicle-collision',
      title: 'Vehicle Telemetry: Collision',
      subtitle: 'High-impact force and no-movement event',
      icon: Car,
      iconClass: 'text-amber-600 bg-amber-50',
      hoverClass: 'hover:border-amber-200 hover:bg-amber-50/50',
      payload: { type: 'Accident', impact: 45, no_movement: true }
    },
    {
      id: 'panic-stroke',
      title: 'App Panic Button',
      subtitle: 'Immediate distress signal from mobile app',
      icon: HeartPulse,
      iconClass: 'text-cyan-700 bg-cyan-50',
      hoverClass: 'hover:border-cyan-200 hover:bg-cyan-50/50',
      payload: { type: 'Stroke', impact: 0, no_movement: false }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto pr-1">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
              <Activity className="h-6 w-6 text-cyan-700" />
              Incident Intake Console
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Submit manually reported emergencies or dispatch from verified telemetry triggers. Designed for fast triage with clear operator comfort.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-cyan-700">
            Live Intake Ready
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start pb-4">
        <div className="xl:col-span-3 card rounded-3xl border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-900">Manual Incident Entry</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operator Form</span>
          </div>

          <form onSubmit={submitManual} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                Symptoms / Claimed Incident
              </label>
              <input
                name="symptoms"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                placeholder="e.g. Chest pain with dizziness"
              />
              <p className="mt-2 text-xs text-slate-500">Describe key symptoms in short plain language to improve triage matching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Patient Age</label>
                <input
                  name="age"
                  type="number"
                  required
                  min="0"
                  max="120"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  placeholder="e.g. 54"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Dispatch Policy</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All manual submissions are routed to Decision Engine for ambulance-hospital matching and priority scoring.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary mt-2 h-11 rounded-xl flex justify-center items-center gap-2 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Dispatch...' : 'Submit Dispatch Request'}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 card rounded-3xl border-slate-200 shadow-sm flex flex-col">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900">Automated Trigger Feed</h2>
            <p className="text-xs text-slate-500 mt-1">One-click dispatch for trusted device and telemetry events.</p>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1">
            {quickTriggers.map((trigger) => {
              const Icon = trigger.icon;
              return (
                <button
                  key={trigger.id}
                  onClick={() => triggerEmergency(trigger.payload)}
                  disabled={loading}
                  className={`w-full text-left border border-slate-200 rounded-2xl p-4 bg-white transition-all duration-200 shadow-sm hover:shadow-md ${trigger.hoverClass} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${trigger.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{trigger.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{trigger.subtitle}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
