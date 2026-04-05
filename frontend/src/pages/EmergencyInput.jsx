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
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-800">
        <Activity className="h-8 w-8 text-cyan-600" /> 
        Incident Injection
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Manual Input */}
        <div className="card shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Manual Input Form</h2>
          <form onSubmit={submitManual} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Symptoms / Claimed Incident</label>
              <input 
                name="symptoms"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all" 
                placeholder="e.g. Chest pain, faint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Patient Age</label>
              <input 
                name="age"
                type="number"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all" 
                placeholder="e.g. 54"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary mt-2 flex justify-center items-center gap-2">
              {loading ? 'Processing...' : 'Submit Dispatch Request'}
            </button>
          </form>
        </div>

        {/* Smart Triggers */}
        <div className="flex flex-col gap-4">
          <div className="card h-full flex flex-col justify-center gap-4 bg-gray-50 border-gray-200">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Automated AI Triggers</h2>
            
            <button 
              onClick={() => triggerEmergency({ type: 'Heart Attack', impact: 0, no_movement: false })}
              className="btn bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 shadow-sm flex items-center gap-4 text-left transition-all group"
            >
               <div className="p-2 bg-red-50 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
                 <Watch className="h-6 w-6"/>
               </div>
               <div>
                  <div className="font-bold text-gray-800">Smartwatch Sync: V-Fib</div>
                  <div className="text-xs text-gray-500 font-medium">Detect irregular heartbeat patterns</div>
               </div>
            </button>

            <button 
              onClick={() => triggerEmergency({ type: 'Accident', impact: 45, no_movement: true })}
              className="btn bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-gray-200 shadow-sm flex items-center gap-4 text-left transition-all group"
            >
               <div className="p-2 bg-orange-50 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                 <Car className="h-6 w-6"/>
               </div>
               <div>
                  <div className="font-bold text-gray-800">Vehicle Telemetry: Collision</div>
                  <div className="text-xs text-gray-500 font-medium">High-impact force detected</div>
               </div>
            </button>

            <button 
              onClick={() => triggerEmergency({ type: 'Stroke', impact: 0, no_movement: false })}
              className="btn bg-white hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 border border-gray-200 shadow-sm flex items-center gap-4 text-left transition-all group"
            >
               <div className="p-2 bg-cyan-50 rounded-lg text-cyan-500 group-hover:scale-110 transition-transform">
                 <HeartPulse className="h-6 w-6"/>
               </div>
               <div>
                  <div className="font-bold text-gray-800">App Panic Button</div>
                  <div className="text-xs text-gray-500 font-medium">Immediate patient distress signal</div>
               </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
