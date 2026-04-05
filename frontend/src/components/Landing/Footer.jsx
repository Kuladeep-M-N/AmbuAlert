import { Activity, Globe, Send, Briefcase, Mail, Phone, MapPin, ShieldCheck, Database, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20 overflow-hidden">
        {/* ── Brand Section ── */}
        <div className="col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6 group cursor-default">
            <div className="p-2 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
              <Activity className="h-6 w-6 text-cyan-600" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-gray-900">AmbuAlert</h1>
          </div>
          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 max-w-xs">
            AmbuAlert is an AI-powered emergency response intelligence system designed to reduce critical delays and optimize life-saving decisions in real time.
          </p>
          <div className="flex gap-5">
             <Globe className="h-4 w-4 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
             <Send className="h-4 w-4 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
             <Briefcase className="h-4 w-4 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* ── Capabilities ── */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8 flex items-center gap-2">
            <Zap className="h-3 w-3 text-cyan-500" />
            Capabilities
          </h4>
          <ul className="space-y-4 text-sm font-semibold text-gray-600">
             <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">AI Emergency Dispatch Engine</li>
             <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Real-Time Digital Twin Monitoring</li>
             <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Smart Hospital Allocation System</li>
             <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Predictive Response Intelligence</li>
             <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Metaverse Visualization Layer</li>
          </ul>
        </div>

        {/* ── System / Platform ── */}
        <div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8 flex items-center gap-2">
             <ShieldCheck className="h-4 w-4 text-cyan-500" />
             System / Platform
           </h4>
           <ul className="space-y-4 text-sm font-semibold text-gray-600">
              <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Live Control Center</li>
              <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Response HUD</li>
              <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Incident Simulation</li>
              <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">AI Engine Overview</li>
              <li className="hover:text-cyan-600 hover:translate-x-1 cursor-pointer transition-all duration-200">System Architecture</li>
           </ul>
        </div>

        {/* ── Contact / Operations ── */}
        <div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8 flex items-center gap-2">
             <MapPin className="h-3 w-3 text-cyan-500" />
             Contact / Operations
           </h4>
           <div className="space-y-6">
              <div className="flex items-start gap-4 text-sm text-gray-600 group">
                 <div className="mt-0.5 p-1.5 bg-gray-50 rounded border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                   <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                 </div>
                 <span className="font-semibold">Bengaluru Emergency Ops Center <br /> Karnataka, India</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 group">
                 <div className="p-1.5 bg-gray-50 rounded border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-cyan-600" />
                 </div>
                 <span className="font-semibold">+91 7619225627</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 group">
                 <div className="p-1.5 bg-gray-50 rounded border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-cyan-600" />
                 </div>
                 <span className="font-semibold underline decoration-cyan-500/30 underline-offset-4 hover:decoration-cyan-500 transition-all">
                    kuladeepmn13@gmail.com
                 </span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                  Available for pilot deployments <br /> & research collaborations
                </p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
              © 2026 AmbuAlert. Built for intelligent emergency response systems.
            </p>
         </div>
         
         <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <span className="hover:text-cyan-600 cursor-pointer transition-all flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              Privacy Policy
            </span>
            <span className="hover:text-cyan-600 cursor-pointer transition-all flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              System Security
            </span>
            <span className="hover:text-cyan-600 cursor-pointer transition-all flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              Data Compliance
            </span>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
