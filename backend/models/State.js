const INITIAL_STATE = {
  systemStatus: "IDLE", // IDLE, ACTIVE
  patient: null, // { id, type, severity, location, status, vitals }
  ambulance: null, // { id, location: [lat, lng], eta, status }
  hospital: null, // { id, name, prepStatus }
  route: null // simulate a simple path
};

let currentState = { ...INITIAL_STATE };

module.exports = {
  getState: () => currentState,
  setState: (newState) => {
    currentState = { ...currentState, ...newState };
  },
  resetState: () => {
    currentState = { ...INITIAL_STATE };
  }
};
