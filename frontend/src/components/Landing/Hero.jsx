import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ChevronRight, Play } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../animations/animations.config';

const Hero = ({ onEnter }) => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-24 bg-gray-50">
      
      {/* Refined Background Animation Layers (Subtle approach) */}
      <div className="absolute inset-0 z-0">
        
        {/* Layer 1: Floating Subtle Orbs (Cyan) */}
        <motion.div 
          className="absolute rounded-full animate-float-subtle opacity-30"
          style={{
            width: '500px',
            height: '500px',
            top: '5%',
            left: '2%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25), transparent)',
            filter: 'blur(100px)'
          }}
        />

        {/* Layer 2: Secondary Orb (Red/Pulse) */}
        <motion.div 
          className="absolute rounded-full animate-float-subtle opacity-20"
          style={{
            width: '450px',
            height: '450px',
            bottom: '10%',
            right: '5%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent)',
            filter: 'blur(120px)',
            animationDelay: '2s'
          }}
        />
        
        {/* Layer 3: Flowing Gradient Overlay */}
        <div className="absolute inset-0 opacity-[0.08] animate-gradient-flow pointer-events-none" />

        {/* Layer 4: Animated Light Ray Sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-[-50%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-light-ray" />
        </div>

        {/* Layer 5: Subtle Masked Grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 z-10 text-center"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Status Badge */}
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-100 rounded-full text-cyan-600 text-xs font-bold mb-8 shadow-sm backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </motion.div>
          <span>v1.0.4 - Live Response Protocol Active</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500"
        >
          Real-Time AI-Powered <br />
          <motion.span 
            className="text-cyan-600 uppercase tracking-widest block font-black"
            animate={{ 
              textShadow: [
                '0 0 0px rgba(8, 145, 178, 0)', 
                '0 0 20px rgba(8, 145, 178, 0.2)', 
                '0 0 0px rgba(8, 145, 178, 0)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Emergency Response
          </motion.span>
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          AmbuAlert eliminates critical delays through AI-driven allocation, real-time vital tracking, and seamless hospital coordination.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button 
            onClick={onEnter}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(6, 182, 212, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-xl font-bold transition-all animate-ripple"
          >
            Launch Control Center
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          </motion.button>
          
          <motion.button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold transition-all shadow-sm"
          >
            <Play className="h-4 w-4 text-red-500 fill-red-500" />
            Watch Video Demo
          </motion.button>
        </motion.div>

        {/* HUD Visualization (Already Animated in Previous Step but Refined) */}
        <motion.div 
          className="mt-20 relative px-4 max-w-5xl mx-auto"
          variants={fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10 h-32 bottom-0"></div>
          <motion.div 
            className="p-1 bg-white rounded-3xl border border-gray-200 shadow-2xl relative overflow-hidden group"
            whileHover={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
          >
             <div className="absolute inset-0 bg-cyan-500/[0.02] group-hover:bg-cyan-500/[0.04] transition-all"></div>
             
             {/* Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                   <motion.div className="w-3 h-3 rounded-full bg-red-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                   <motion.div className="w-3 h-3 rounded-full bg-amber-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                   <motion.div className="w-3 h-3 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Digital Twin Ops HUD v1.0.4</div>
             </div>

             {/* Screen Content */}
             <div className="aspect-video bg-white flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full p-2 bg-[radial-gradient(circle_at_center,#f9fafb_0%,#fff_100%)]">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,#0ea5e9_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Activity className="h-64 w-64 text-cyan-500" />
                  </motion.div>

                  <motion.div 
                    className="absolute top-10 left-10 p-5 bg-white border border-cyan-100 rounded-2xl shadow-xl backdrop-blur-md"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <motion.div 
                      className="text-red-600 font-black text-3xl font-mono"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      143 <span className="text-xs">BPM</span>
                    </motion.div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Vital Level: Critical</div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute bottom-10 right-10 p-5 bg-white border border-emerald-100 rounded-2xl shadow-xl backdrop-blur-md"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                  >
                     <div className="text-emerald-600 font-black flex items-center gap-2 mb-1">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                          <Activity className="h-4 w-4" />
                        </motion.div>
                        A-32 ACTIVE
                     </div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ETA: 4 MINUTES</div>
                  </motion.div>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
