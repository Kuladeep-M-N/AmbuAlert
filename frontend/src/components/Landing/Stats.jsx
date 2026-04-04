import { Activity, Clock, ShieldCheck, Users } from 'lucide-react';

const Stats = ({ stats }) => {
  const ambulanceCount = stats?.ambulances?.length || 14;
  const hospitalCount = stats?.hospitals?.filter(h => h.status === 'ONLINE').length || 4;

  const displayStats = [
    { label: "Avg. Response Time", value: "3.2m", icon: Clock, color: "text-red-500" },
    { label: "Active Ambulances", value: ambulanceCount, icon: Activity, color: "text-blue-500" },
    { label: "Hospitals Online", value: hospitalCount, icon: Building2, color: "text-emerald-500" },
    { label: "Service Coverage", value: "99.8%", icon: ShieldCheck, color: "text-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {displayStats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-slate-900 border border-slate-700/50 p-8 rounded-2xl text-center group transition-all hover:bg-slate-800 hover:border-slate-600">
             <div className="flex items-center justify-center mb-4">
                <Icon className={`w-10 h-10 ${stat.color} transition-transform group-hover:scale-110`} />
             </div>
             <div className="text-3xl md:text-4xl font-black text-slate-50 mb-2">{stat.value}</div>
             <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Internal Import helper
import { Building2 } from 'lucide-react';

export default Stats;
