import { AlertTriangle, Cpu, Ambulance, Hospital, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: AlertTriangle,
      title: "Emergency Trigger",
      description: "Smart sensors, wearables, or manual panic buttons broadcast an SOS with precise location and telemetry.",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      icon: Cpu,
      title: "AI Analysis",
      description: "Our engine analyzes hospital load, traffic, and patient vitals to determine the optimal response unit.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Ambulance,
      title: "Dispatch & Tracking",
      description: "Ambulance is dispatched with live turn-by-turn routing and continuous patient vital streaming.",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      icon: Hospital,
      title: "ER Preparation",
      description: "Receiving hospital auto-assigns a bed and specialist based on real-time inbound data.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: CheckCircle,
      title: "Dynamic Feedback",
      description: "System self-optimizes based on the outcome of the incident for future response scaling.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <div className="relative">
      <div className="text-center mb-16">
         <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4 uppercase tracking-tight">How it <span className="text-red-500">Works</span></h2>
         <p className="text-slate-400 text-sm max-w-xl mx-auto">From the first second of an emergency to successful hospital handoff, AmbuAlert manages every critical step.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative">
        {/* Connector Line (Desktop Only) */}
        <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-red-500/20 via-blue-500/20 to-indigo-500/20 z-0"></div>
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center text-center group z-10 px-4">
               <div className={`w-20 h-20 rounded-full ${step.bg} border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                  <Icon className={`w-10 h-10 ${step.color}`} />
               </div>
               <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2 px-2 py-0.5 bg-slate-800 rounded-full">Step 0{idx + 1}</div>
               <h4 className="text-lg font-bold text-slate-50 mb-3">{step.title}</h4>
               <p className="text-xs text-slate-400 leading-relaxed px-4">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorks;
