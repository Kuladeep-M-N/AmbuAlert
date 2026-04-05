import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ChevronRight, Play } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../animations/animations.config';

const Hero = ({ onEnter }) => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gray-50">
      
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

      </motion.div>
    </section>
  );
};

export default Hero;
