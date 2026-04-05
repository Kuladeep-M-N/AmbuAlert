import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertTriangle, Cpu, Activity, Building2, Map, LayoutDashboard } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../animations/animations.config';

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });

  const features = [
    {
      icon: AlertTriangle,
      title: "Incident Injection",
      description: "Trigger emergency responses via wearable sync, vehicle telemetry, or specialized panic buttons.",
      benefit: "Zero-latency incident reporting.",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      icon: Cpu,
      title: "AI Decision Core",
      description: "Proprietary algorithms analyze hospital load, traffic, and vitals to determine the optimal response unit.",
      benefit: "Optimized resource allocation.",
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      icon: Activity,
      title: "Digital Twin Vitals",
      description: "Synchronized medical telemetry streams patient data to the ER before the ambulance even arrives.",
      benefit: "Superior clinical readiness.",
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      icon: Building2,
      title: "Hospital Hub",
      description: "Real-time bed availability and trauma team status monitoring across the city healthcare network.",
      benefit: "Reduced bypass frequency.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      icon: Map,
      title: "Metaverse Ops",
      description: "3D situational awareness for dispatchers, combining satellite imagery with live traffic vectors.",
      benefit: "Enhanced spatial grounding.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: LayoutDashboard,
      title: "Unified Command",
      description: "A centralized dashboard for cross-agency coordination between EMS, Fire, and Hospital staff.",
      benefit: "Eliminated silos.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <section className="relative py-12">
      {/* Subtle Background Grid for section depth */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(3, 105, 161, 0.1) 1px, transparent 1px), linear-gradient(180deg, rgba(3, 105, 161, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">Core System Capabilities</h2>
        <div className="w-20 h-1.5 bg-cyan-600 mx-auto rounded-full"></div>
      </motion.div>

      <motion.div 
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              whileHover={{ 
                y: -12,
                borderColor: 'rgba(8, 145, 178, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
              }}
              className="group relative p-8 bg-white border border-gray-100 rounded-2xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <motion.div 
                  className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 shadow-sm`}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                >
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-cyan-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                  {feature.description}
                </p>
                
                <motion.div 
                  className="flex items-center gap-2 pt-4 border-t border-gray-100"
                  animate={isInView ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                >
                   <span className={`text-[10px] font-black uppercase tracking-widest ${feature.color}`}>
                     Key Benefit:
                   </span>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                     {feature.benefit}
                   </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Features;
