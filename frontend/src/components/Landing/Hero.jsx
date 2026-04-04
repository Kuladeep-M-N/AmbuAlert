import { Activity, ShieldCheck, ChevronRight, Play } from 'lucide-react';

const Hero = ({ onEnter }) => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-24">
      {/* Background Gradients/Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(15,23,42,1)_80%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold mb-8 animate-bounce">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>v1.0.4 - Live Response Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-50 to-slate-400">
          Real-Time AI-Powered <br />
          <span className="text-red-500 uppercase tracking-widest">Emergency Response</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AmbuAlert eliminates critical delays in emergency response through AI-driven resource allocation, real-time vital tracking, and seamless hospital coordination.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onEnter}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Launch Control Center
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition-all">
            <Play className="h-4 w-4 text-emerald-400 fill-emerald-400" />
            Watch Video Demo
          </button>
        </div>

        {/* Visual Mock/Badge */}
        <div className="mt-20 relative px-4">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 h-32 bottom-0"></div>
          <div className="p-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-all"></div>
             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                <div className="flex items-center gap-4">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AmbuAlert HUD v1.0.4</div>
             </div>
             <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                  {/* Simplistic animated HUD background */}
                  <Activity className="absolute inset-0 m-auto h-32 w-32 text-red-500/20 animate-pulse" />
                  <div className="absolute top-10 left-10 p-4 bg-slate-800/80 border border-slate-700 rounded-lg backdrop-blur-sm">
                    <div className="text-red-500 font-bold text-lg">143 BPM</div>
                    <div className="text-[10px] text-slate-400">PATIENT VITAL LEVEL: CRITICAL</div>
                  </div>
                  <div className="absolute bottom-10 right-10 p-4 bg-slate-800/80 border border-slate-700 rounded-lg backdrop-blur-sm">
                     <div className="text-emerald-500 font-bold">AMBULANCE A-32</div>
                     <div className="text-[10px] text-slate-400">ETA: 4 MINUTES</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
