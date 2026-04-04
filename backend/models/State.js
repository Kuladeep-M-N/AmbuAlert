const INITIAL_STATE = {
  systemStatus: "IDLE", // IDLE, ACTIVE
  patient: null, // { id, type, severity, location, status, vitals }
  ambulances: [],  // Array of fleet units { id, location, eta, status, cost, distanceStr }
  dispatchedAmbulanceId: null, // ID of the actively dispatched ambulance
  hospital: null, // { id, name, location, spec, selectionReason, prepStatus }
  routes: [], // { id, coordinates, color, etaMinutes, distanceStr, trafficString, isOptimal }
  currentRouteIndex: 0
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
