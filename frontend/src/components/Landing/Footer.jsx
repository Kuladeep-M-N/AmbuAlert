import { Activity, Globe, Send, Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-8 w-8 text-cyan-600" />
            <h1 className="text-2xl font-black tracking-tight text-gray-900">AmbuAlert</h1>
          </div>
          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
            AI-powered emergency response management system designed for the next generation of clinical orchestration.
          </p>
          <div className="flex gap-4">
             <Globe className="h-5 w-5 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
             <Send className="h-5 w-5 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
             <Briefcase className="h-5 w-5 text-gray-400 hover:text-cyan-600 cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Capabilities</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
             <li className="hover:text-cyan-600 cursor-pointer transition-colors">AI Resource Dispatch</li>
             <li className="hover:text-cyan-600 cursor-pointer transition-colors">Digital Twin Vitals</li>
             <li className="hover:text-cyan-600 cursor-pointer transition-colors">Hospital Sync Hub</li>
             <li className="hover:text-cyan-600 cursor-pointer transition-colors">Metaverse Comm Layer</li>
          </ul>
        </div>

        <div>
           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Clinical Support</h4>
           <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li className="hover:text-cyan-600 cursor-pointer transition-colors">Integration Guide</li>
              <li className="hover:text-cyan-600 cursor-pointer transition-colors">Case Studies</li>
              <li className="hover:text-cyan-600 cursor-pointer transition-colors">Security Manual</li>
              <li className="hover:text-cyan-600 cursor-pointer transition-colors">Contact Ethics Board</li>
           </ul>
        </div>

        <div>
           <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Operations</h4>
           <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-500">
                 <MapPin className="h-5 w-5 text-cyan-600 shrink-0" />
                 <span>Global Trauma Center HQ <br /> Bengaluru, KA 560001</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                 <Phone className="h-5 w-5 text-cyan-600 shrink-0" />
                 <span>+91 800 AMBU HELP</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                 <Mail className="h-5 w-5 text-cyan-600 shrink-0" />
                 <span>ops@ambualert.io</span>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
           © 2026 AmbuAlert DT Deployment. All Rights Reserved. Clinical-Grade Infrastructure.
         </p>
         <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <span className="hover:text-cyan-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cyan-600 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-cyan-600 cursor-pointer transition-colors">License</span>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
