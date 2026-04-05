import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AppLayout from './components/Navigation/AppLayout';

import Dashboard from './pages/Dashboard';
import EmergencyInput from './pages/EmergencyInput';
import DecisionEngine from './pages/DecisionEngine';
import LiveResponse from './pages/LiveResponse';
import HospitalHub from './pages/HospitalHub';
import Metaverse from './pages/Metaverse';

import { useRole } from './context/RoleContext';
import { HospitalProvider } from './context/HospitalContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  const { hasAccess } = useRole();

  return (
    <HospitalProvider>
      <SocketProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Main App with Role-Based Layout */}
          <Route path="/app" element={<AppLayout />}>
             <Route index element={<Navigate to="/app/dashboard" replace />} />
             
             {/* Conditionally rendered based on role mapping defined in RoleContext/Sidebar */}
             <Route path="dashboard" element={hasAccess('dashboard') ? <Dashboard /> : <Navigate to="/app" />} />
             <Route path="input" element={hasAccess('input') ? <EmergencyInput /> : <Navigate to="/app" />} />
             <Route path="decision" element={hasAccess('decision') ? <DecisionEngine /> : <Navigate to="/app" />} />
             <Route path="live" element={hasAccess('live') ? <LiveResponse /> : <Navigate to="/app" />} />
             <Route path="hospital-hub" element={hasAccess('hospital') ? <HospitalHub /> : <Navigate to="/app" />} />
             <Route path="metaverse" element={hasAccess('metaverse') ? <Metaverse /> : <Navigate to="/app" />} />
          </Route>

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </HospitalProvider>
  );
}

export default App;
