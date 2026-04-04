import { AlertTriangle, Cpu, Activity, Building2, Map, LayoutDashboard } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: "Incident Injection",
      description: "Trigger emergency responses via wearable sync, vehicle telemetry, or specialized panic buttons.",
      benefit: "Zero-latency incident reporting.",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      icon: Cpu,
      title: "AI Decision Engine",
      description: "Smart algorithms route patients to the nearest hospital with appropriate specialists and zero queue time.",
      benefit: "Reduces response time by 40%.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Activity,
      title: "Live Response HUD",
      description: "Real-time tracking of ambulance movements, patient vitals, and field telemetry on a unified dashboard.",
      benefit: "Continuous patient oversight.",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      icon: Building2,
      title: "Hospital Coordination",
      description: "Dynamic bed availability, real-time specialist updates, and digital ER handoff across the hospital network.",
      benefit: "Optimized resource usage.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Map,
      title: "Metaverse Integration",
      description: "High-fidelity 3D visualization of the emergency ecosystem for advanced command and control simulation.",
      benefit: "Holistic system awareness.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      icon: LayoutDashboard,
      title: "System Dashboard",
      description: "Unified command center for active incidents, resource heatmaps, and historical response analytics.",
      benefit: "Actionable macro insights.",
      color: "text-slate-200",
      bg: "bg-slate-200/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <div 
            key={idx} 
            className="group relative p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl transition-all hover:bg-slate-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50"
          >
            <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <Icon className={`w-8 h-8 ${feature.color}`} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-50 mb-4">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {feature.description}
            </p>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
               <span className={`text-[10px] font-black uppercase tracking-widest ${feature.color}`}>
                 Key Impact:
               </span>
               <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                 {feature.benefit}
               </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Features;
