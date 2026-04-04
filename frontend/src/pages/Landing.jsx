import { useEffect, useState } from 'react';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Stats from '../components/Landing/Stats';
import HowItWorks from '../components/Landing/HowItWorks';
import Footer from '../components/Landing/Footer';
import RoleSelector from '../components/Landing/RoleSelector';

const Landing = () => {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [systemStats, setSystemStats] = useState(null);

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
    <div className="bg-slate-900 border-none selection:bg-red-500/30 selection:text-red-200">
      <Hero onEnter={() => setShowRoleSelector(true)} />
      
      <div id="features" className="max-w-7xl mx-auto px-4 py-24">
        <Features />
      </div>

      <div id="stats" className="bg-slate-950/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <Stats stats={systemStats} />
        </div>
      </div>

      <div id="how-it-works" className="max-w-7xl mx-auto px-4 py-24">
        <HowItWorks />
      </div>

      <Footer stats={systemStats} />

      {showRoleSelector && (
        <RoleSelector onClose={() => setShowRoleSelector(false)} />
      )}
    </div>
  );
};

export default Landing;
