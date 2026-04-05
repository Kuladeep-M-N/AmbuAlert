import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertTriangle, Cpu, Ambulance, Hospital, CheckCircle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../animations/animations.config';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });

  const steps = [
    {
      icon: AlertTriangle,
      title: "Emergency Trigger",
      description: "Smart sensors and wearables broadcast an SOS with precise location and telemetry.",
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      icon: Cpu,
      title: "AI Analysis",
      description: "Our engine analyzes hospital load and traffic to determine the optimal response unit.",
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      icon: Ambulance,
      title: "Dispatch",
      description: "Ambulance is dispatched with live turn-by-turn routing and vital streaming.",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      icon: Hospital,
      title: "ER Prep",
      description: "Receiving hospital auto-assigns a bed based on real-time inbound data.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: CheckCircle,
      title: "Optimization",
      description: "System self-optimizes based on the outcome for future response scaling.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ];

  return (
    <div className="py-12">
      <motion.div 
        className="text-center mb-24"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
         <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 uppercase tracking-[0.05em]">
           The Response <motion.span 
             className="text-cyan-600 inline-block"
             animate={{ 
               scale: [1, 1.05, 1],
               textShadow: [
                 '0 0 0px rgba(6, 182, 212, 0)', 
                 '0 0 20px rgba(6, 182, 212, 0.1)', 
                 '0 0 0px rgba(6, 182, 212, 0)'
               ]
             }}
             transition={{ duration: 3, repeat: Infinity }}
           >
             Lifecycle
           </motion.span>
         </h2>
         <div className="w-20 h-1.5 bg-gray-200 mx-auto rounded-full"></div>
      </motion.div>

      <motion.div 
        ref={ref}
        className="flex flex-col lg:flex-row items-start justify-between gap-12 relative"
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
      >
        {/* Animated Connector Line (Desktop) */}
        <motion.div 
          className="hidden lg:block absolute top-[52px] left-20 right-20 h-0.5 bg-gradient-to-r from-cyan-100 via-gray-200 to-emerald-100 z-0"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        >
          <motion.div 
             className="h-full bg-cyan-600 w-20 shadow-[0_0_10px_#0ea5e9]"
             animate={{ x: ['-100%', '100vw'] }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              className="flex-1 flex flex-col items-center text-center group z-10 px-4"
              whileHover={{ y: -8 }}
            >
               {/* Step Badge (Above circle) */}
               <motion.div 
                 className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-4 px-3 py-1 bg-gray-100 rounded-full border border-gray-200 ring-4 ring-white"
                 animate={{ 
                   borderColor: [
                     'rgba(229, 231, 235, 1)', 
                     'rgba(14, 165, 233, 0.4)', 
                     'rgba(229, 231, 235, 1)'
                   ]
                 }}
                 transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
               >
                 Phase 0{idx + 1}
               </motion.div>

               <motion.div 
                 className={`w-28 h-28 rounded-full ${step.bg} border-4 border-white flex items-center justify-center mb-6 shadow-xl relative transition-all group-hover:shadow-2xl group-hover:scale-110`}
                 animate={{
                   boxShadow: isInView ? [
                     '0 0 0px rgba(6, 182, 212, 0)', 
                     '0 0 40px rgba(6, 182, 212, 0.1)', 
                     '0 0 0px rgba(6, 182, 212, 0)'
                   ] : []
                 }}
                 transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }}
               >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    <Icon className={`w-10 h-10 ${step.color} transition-transform`} />
                  </motion.div>
               </motion.div>

               <motion.h4 
                 className="text-lg font-black text-gray-800 mb-3 group-hover:text-cyan-600 transition-colors"
                 animate={{ opacity: isInView ? [0.8, 1, 0.8] : 1 }}
                 transition={{ duration: 3, repeat: Infinity, delay: idx * 0.15 }}
               >
                 {step.title}
               </motion.h4>

               <p className="text-xs text-gray-500 font-medium leading-relaxed px-4">
                 {step.description}
               </p>

               {/* Mobile separator */}
               {idx < steps.length - 1 && (
                 <motion.div
                   className="lg:hidden mt-8 w-1 h-12 bg-gradient-to-b from-gray-200 to-transparent"
                   animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                 />
               )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HowItWorks;
