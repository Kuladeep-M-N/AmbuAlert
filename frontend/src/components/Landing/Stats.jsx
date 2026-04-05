import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Activity, Clock, ShieldCheck, Building2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../animations/animations.config';

// Animated counter component for numeric values
const AnimatedCounter = ({ target, value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    // Determine the numeric target: if target is "3.2m", end=3.2, suffix="m"
    const numPart = typeof value === 'string' ? parseFloat(value.match(/[\d.]+/)[0]) : value;
    const suffix = typeof value === 'string' ? value.replace(/[\d.]+/, '') : "";
    
    const end = numPart;
    const increment = end / (duration * 60);
    
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isInView, value, duration]);

  // Format the output: if it's 3.2, show to 1 decimal place, else floor it
  const formattedCount = Number.isInteger(parseFloat(value)) ? Math.floor(count) : count.toFixed(1);

  return (
    <span ref={ref}>
      {formattedCount}{typeof value === 'string' ? value.replace(/[\d.]+/, '') : ""}
    </span>
  );
};

const Stats = ({ stats }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });

  const ambulanceCount = stats?.ambulances?.length || 14;
  const hospitalCount = stats?.hospitals?.filter(h => h.status === 'ONLINE').length || 4;

  const displayStats = [
    { label: "Avg. Response Time", value: "3.2m", icon: Clock, color: "text-red-500", bg: "bg-red-50" },
    { label: "Active Ambulances", value: ambulanceCount.toString(), icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Hospitals Online", value: hospitalCount.toString(), icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Service Coverage", value: "99.8%", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Subtle Background Pulse for system vitality */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/[0.05] animate-pulse-subtle z-0" />

      <motion.div 
        ref={ref}
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
      >
        {displayStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              whileHover={{ scale: 1.05, borderColor: 'rgba(8, 145, 178, 0.2)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}
              className="group relative bg-white border border-gray-100 p-8 rounded-3xl text-center transition-all cursor-pointer overflow-hidden shadow-sm"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

               <div className="relative z-10">
                 <motion.div 
                   className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-sm`}
                   animate={{ 
                     y: [0, -5, 0],
                     scale: [1, 1.05, 1]
                   }}
                   transition={{ 
                     duration: 3,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: idx * 0.2
                   }}
                 >
                    <Icon className="w-7 h-7" />
                 </motion.div>

                 <div className="text-3xl md:text-5xl font-black text-gray-800 mb-3 tracking-tighter">
                   <AnimatedCounter value={stat.value} />
                 </div>

                 <div className="text-[10px] uppercase tracking-widest text-gray-400 font-black">
                   {stat.label}
                 </div>
               </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Stats;
