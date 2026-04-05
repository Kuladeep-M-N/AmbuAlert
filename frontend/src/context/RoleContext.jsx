import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('ambualert_role') || 'public';
  });

  const updateRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('ambualert_role', newRole);
  };

  const roles = {
    admin: { label: 'Administrator', access: ['dashboard', 'input', 'decision', 'live', 'hospital', 'metaverse'] },
    paramedic: { label: 'Field Responder', access: ['dashboard', 'input', 'decision', 'live', 'hospital'] },
    doctor: { label: 'ER Specialist', access: ['hospital'] },
    public: { label: 'Citizen Portal', access: ['dashboard', 'live'] },
  };

  const hasAccess = (page) => {
    if (!role || !roles[role]) return false;
    return roles[role].access.includes(page);
  };

  return (
    <RoleContext.Provider value={{ role, updateRole, roles, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
};
