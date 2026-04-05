import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '../context/RoleContext';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Stats from '../components/Landing/Stats';
import HowItWorks from '../components/Landing/HowItWorks';
import Footer from '../components/Landing/Footer';
import RoleSelector from '../components/Landing/RoleSelector';

const Landing = () => {
  const navigate = useNavigate();
  const { updateRole } = useRole();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [systemStats, setSystemStats] = useState(null);

  const handleRoleSelect = (roleKey) => {
    updateRole(roleKey);
    setShowRoleSelector(false);
    navigate('/app');
  };

  useEffect(() => {
    // Fetch system status for the footer/stats
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/status');
        const data = await response.json();
        setSystemStats(data);
      } catch (error) {
        console.error('Error fetching system status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 border-none selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* Global Background Layer: Animated Grid */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.15] animate-grid-shift"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px),
            linear-gradient(180deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10">
        <Hero onEnter={() => setShowRoleSelector(true)} />
      
      <div id="features" className="max-w-7xl mx-auto px-4 py-24">
        <Features />
      </div>

      <div id="stats" className="bg-white border-y border-gray-100 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <Stats stats={systemStats} />
        </div>
      </div>

      <div id="how-it-works" className="max-w-7xl mx-auto px-4 py-24">
        <HowItWorks />
      </div>

      <Footer stats={systemStats} />

      <AnimatePresence>
        {showRoleSelector && (
          <RoleSelector 
            onSelect={handleRoleSelect} 
            onClose={() => setShowRoleSelector(false)} 
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Landing;
