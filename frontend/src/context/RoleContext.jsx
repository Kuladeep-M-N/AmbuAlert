import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('ambualert_role') || 'viewer';
  });

  const updateRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('ambualert_role', newRole);
  };

  const roles = {
    admin: { label: 'Administrator', access: ['dashboard', 'input', 'decision', 'live', 'hospital', 'metaverse'] },
    dispatcher: { label: 'Emergency Dispatcher', access: ['dashboard', 'input', 'decision', 'live', 'hospital'] },
    hospital: { label: 'Hospital Operator', access: ['hospital'] },
    viewer: { label: 'System Viewer', access: ['dashboard', 'live'] },
  };

  const hasAccess = (page) => {
    return roles[role].access.includes(page);
  };

  return (
    <RoleContext.Provider value={{ role, updateRole, roles, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
};
