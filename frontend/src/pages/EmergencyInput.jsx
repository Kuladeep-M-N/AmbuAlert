import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Watch, Car, HeartPulse, Activity } from 'lucide-react';

export default function EmergencyInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const triggerEmergency = async (payload) => {
    setLoading(true);
    try {
      await fetch('http://localhost:3000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setTimeout(() => navigate('/app/decision'), 600);
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

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Activity className="h-8 w-8 text-blue-500" /> 
        Incident Injection
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Manual Input */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Manual Input Form</h2>
          <form onSubmit={submitManual} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Symptoms / Claimed Incident</label>
              <input 
                name="symptoms"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                placeholder="e.g. Chest pain, faint"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Patient Age</label>
              <input 
                name="age"
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                placeholder="e.g. 54"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary mt-2">
              Submit Record
            </button>
          </form>
        </div>

        {/* Smart Triggers */}
        <div className="flex flex-col gap-4">
          <div className="card h-full flex flex-col justify-center gap-4">
            <h2 className="text-xl font-bold mb-2 text-slate-300">Automated AI Triggers</h2>
            
            <button 
              onClick={() => triggerEmergency({ type: 'Heart Attack', impact: 0, no_movement: false })}
              className="btn bg-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 border border-transparent flex items-center gap-3 text-left"
            >
               <Watch className="h-6 w-6"/>
               <div>
                  <div className="font-bold">Smartwatch Sync: V-Fib</div>
                  <div className="text-xs text-slate-400 font-normal">Simulate irregular heartbeat detection</div>
               </div>
            </button>

            <button 
              onClick={() => triggerEmergency({ type: 'Accident', impact: 45, no_movement: true })}
              className="btn bg-slate-700 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500 border border-transparent flex items-center gap-3 text-left"
            >
               <Car className="h-6 w-6"/>
               <div>
                  <div className="font-bold">Vehicle Telemetry: Collision</div>
                  <div className="text-xs text-slate-400 font-normal">Impact &gt; 30g + No Movement</div>
               </div>
            </button>

            <button 
              onClick={() => triggerEmergency({ type: 'Stroke', impact: 0, no_movement: false })}
              className="btn bg-slate-700 hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500 border border-transparent flex items-center gap-3 text-left"
            >
               <HeartPulse className="h-6 w-6"/>
               <div>
                  <div className="font-bold">App Panic Button</div>
                  <div className="text-xs text-slate-400 font-normal">General distress / stroke symptoms</div>
               </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
