import { Activity, ShieldCheck, Heart, Radio, Globe } from 'lucide-react';

const Footer = ({ stats }) => {
  const isConnected = stats !== null;

  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <Activity className="h-8 w-8 text-red-500" />
                <h2 className="text-xl font-bold tracking-wider text-slate-50">AmbuAlert</h2>
             </div>
             <p className="text-sm text-slate-400 leading-relaxed mb-6">
               Leading the future of emergency response with AI-powered dispatch, live vital monitoring, and seamless care coordination.
             </p>
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                   System Hub: {isConnected ? 'LIVE' : 'OFFLINE'}
                   {isConnected && <Radio className="h-3 w-3 text-emerald-500" />}
                </div>
             </div>
          </div>

          <div>
             <h4 className="text-slate-50 font-bold mb-6 uppercase tracking-widest text-xs">Resources</h4>
             <ul className="space-y-4">
                <li><a href="#features" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Features HUD</a></li>
                <li><a href="#stats" className="text-slate-400 hover:text-red-500 text-sm transition-colors">System Metrics</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Operational Flow</a></li>
                <li><a href="#" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Documentation</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-slate-50 font-bold mb-6 uppercase tracking-widest text-xs">Access Points</h4>
             <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Admin Dashboard</a></li>
                <li><a href="#" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Dispatch Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Hospital Login</a></li>
                <li><a href="#" className="text-slate-400 hover:text-red-500 text-sm transition-colors">Metaverse Hub</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-slate-50 font-bold mb-6 uppercase tracking-widest text-xs">Network Status</h4>
             <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Emergency Dispatch</span>
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                   </div>
                   <div className="text-xs text-slate-300 font-medium">99.9% Uptime Verified</div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Vital Sync Latency</span>
                      <Radio className="h-3 w-3 text-blue-500" />
                   </div>
                   <div className="text-xs text-slate-300 font-medium">&lt; 45ms (Optimal)</div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
           <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              &copy; 2026 AmbuAlert <span className="h-1 w-1 bg-slate-800 rounded-full"></span> 
              Made with <Heart className="h-3 w-3 text-red-500 inline fill-red-500" /> for humanity
           </div>
           
           <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors"><Globe className="h-4 w-4" /></a>
              <div className="w-[1px] h-4 bg-slate-800"></div>
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                 Operational Command Center v1.0.4 - STABLE
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
