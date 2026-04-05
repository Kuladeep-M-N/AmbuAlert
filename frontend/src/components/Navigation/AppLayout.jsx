import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { socket } from '../../socket';
import { useRole } from '../../context/RoleContext';
import { Home, LayoutDashboard } from 'lucide-react';

const AppLayout = () => {
  const { role } = useRole();
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Only connect if we are in the app and have a role
    if (role) {
      socket.connect();
    }

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
  }, [role]);

  const handleReset = () => {
    socket.emit('reset_simulation');
  };

  if (!role) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex bg-gray-50 text-gray-800" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar isConnected={isConnected} onReset={handleReset} />

      <div className="flex-1 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Universal App Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20" style={{ height: '52px' }}>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            <LayoutDashboard className="h-4 w-4 text-cyan-600" />
            <span>Control Center / {location.pathname.split('/').pop()}</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-cyan-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </header>

        {/* Content fills all remaining height — no page-level scroll */}
        <main className="flex-1 p-4 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
