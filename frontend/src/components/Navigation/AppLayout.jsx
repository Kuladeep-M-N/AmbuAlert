import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { socket } from '../../socket';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  const handleReset = () => {
    fetch('http://localhost:3000/api/decision', { method: 'POST' }).catch(() => {});
    socket.emit('reset_simulation');
  };

  return (
    <div className="flex bg-slate-900 text-slate-50 min-h-screen">
      <Sidebar isConnected={isConnected} onReset={handleReset} />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        {/* Universal App Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
             <LayoutDashboard className="h-4 w-4" />
             <span>Control Center / {location.pathname.split('/').pop()}</span>
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Internal imports
import { Home, LayoutDashboard } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default AppLayout;
