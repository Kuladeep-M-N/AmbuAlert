import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Cpu, Loader, Network, CheckCircle } from 'lucide-react';

export default function DecisionEngine() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Fetch current state decision
    fetch('http://localhost:3000/api/decision', { method: 'POST' })
      .then(res => res.json())
      .then(d => {
        if (d.error || (!d.dispatchedAmbulance && !d.ambulance)) {
          navigate('/');
        } else {
          setData(d);
        }
      })
      .catch(console.error);
  }, [navigate]);

  useEffect(() => {
    if (data) {
      // Step-by-step animation
      const interval = setInterval(() => {
        setStep(s => {
          if (s >= 4) {
            clearInterval(interval);
            setTimeout(() => navigate('/app/live'), 2000);
            return s;
          }
          return s + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [data, navigate]);

  if (!data) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-cyan-500 w-12 h-12" /></div>;

  const steps = [
    { label: "Receiving Telemetry", icon: Network, isActive: step >= 0 },
    { label: `Classifying Severity: ${data.patient.severity}`, icon: BrainCircuit, isActive: step >= 1, isCritical: data.patient.severity === 'CRITICAL' },
    { label: `Assigning Ambulance: ${(data.dispatchedAmbulance || data.ambulance)?.id ?? 'Best Unit'}`, icon: Cpu, isActive: step >= 2 },
    { label: `Targeting Hospital: ${data.hospital.name}`, icon: CheckCircle, isActive: step >= 3 },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-full py-12 animate-in zoom-in-95 duration-500">
      
      <div className="relative mb-12 flex items-center justify-center">
         <div className={`absolute inset-0 bg-cyan-500 rounded-full blur-[80px] opacity-10 ${step >= 4 ? 'animate-pulse' : ''}`}></div>
         <BrainCircuit className="w-24 h-24 text-cyan-600 relative z-10" />
      </div>

      <h2 className="text-3xl font-bold tracking-widest uppercase mb-8 text-gray-800">AI Decision Core</h2>

      <div className="w-full card p-8 relative overflow-hidden bg-white border border-gray-200 shadow-md">
        {/* Connection line background */}
        <div className="absolute left-11 top-12 bottom-12 w-0.5 bg-gray-100"></div>

        <div className="flex flex-col gap-8 relative z-10">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-6 transition-all duration-700 ${s.isActive ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-8'}`}>
              <div className={`p-3 rounded-full transition-colors duration-500 border-2 ${
                s.isActive 
                  ? (s.isCritical && i===1 ? 'bg-red-500 border-red-600 glow-red' : 'bg-cyan-500 border-cyan-600') 
                  : 'bg-gray-50 border-gray-100'
              }`}>
                 <s.icon className={`w-6 h-6 ${s.isActive ? 'text-white' : 'text-gray-300'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-lg font-bold uppercase tracking-tight transition-colors duration-500 ${s.isActive ? (s.isCritical && i===1 ? 'text-red-700' : 'text-gray-900') : 'text-gray-400'}`}>
                  {s.label}
                </p>
                {s.isActive && i === step && i < 3 && (
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse mt-1">AI analyzing parameters...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className={`mt-8 text-gray-500 font-bold uppercase tracking-widest transition-opacity duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        Finalizing route... Routing to Live HUD
      </p>

    </div>
  );
}
