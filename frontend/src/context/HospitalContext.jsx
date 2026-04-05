import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  // 1. Initial State (5 specialized centers)
  const initialHospitals = [
    { id: 'HOSP-01', name: 'Narayana Cardiac Center', spec: 'CARDIAC', totalBeds: 15, availableBeds: 12 },
    { id: 'HOSP-02', name: 'BMS Trauma Specialty', spec: 'TRAUMA', totalBeds: 10, availableBeds: 8 },
    { id: 'HOSP-03', name: 'Victoria General', spec: 'GENERAL', totalBeds: 30, availableBeds: 24 },
    { id: 'HOSP-04', name: 'Indira Gandhi Pediatric', spec: 'PEDIATRIC', totalBeds: 18, availableBeds: 15 },
    { id: 'HOSP-05', name: 'St. Johns Burn Center', spec: 'BURN', totalBeds: 8, availableBeds: 6 }
  ];

  const [hospitals, setHospitals] = useState(() => {
    const saved = localStorage.getItem('ambualert_hospitals');
    return saved ? JSON.parse(saved) : initialHospitals;
  });

  const [admittedPatients, setAdmittedPatients] = useState(() => {
    const saved = localStorage.getItem('ambualert_admitted');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Persistence Layer
  useEffect(() => {
    localStorage.setItem('ambualert_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('ambualert_admitted', JSON.stringify(admittedPatients));
  }, [admittedPatients]);

  // 3. Clinical Actions
  const admitPatient = (patient, hospitalId) => {
    // Prevent duplicate admission
    if (admittedPatients.find(p => p.id === patient.id)) return;

    const admissionTime = new Date().toLocaleTimeString();
    
    // Add to persistent ledger
    setAdmittedPatients(prev => [{
      ...patient,
      admittedAt: admissionTime,
      admittingHospitalId: hospitalId
    }, ...prev]);

    // Permanently decrement bed count
    setHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        return { ...h, availableBeds: Math.max(0, h.availableBeds - 1) };
      }
      return h;
    }));
  };

  const resetSystem = () => {
    localStorage.removeItem('ambualert_hospitals');
    localStorage.removeItem('ambualert_admitted');
    setHospitals(initialHospitals);
    setAdmittedPatients([]);
  };

  return (
    <HospitalContext.Provider value={{
      hospitals,
      admittedPatients,
      admitPatient,
      resetSystem
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) throw new Error('useHospital must be used within a HospitalProvider');
  return context;
};
