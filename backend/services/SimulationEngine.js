const State = require('../models/State');

class SimulationEngine {
  constructor() {
    this.io = null;
    this.intervalId = null;
  }

  setIo(io) {
    this.io = io;
  }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000); // Run every second
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  tick() {
    const state = State.getState();
    if (state.systemStatus !== 'ACTIVE') return;

    let { patient, ambulance, hospital } = state;

    if (ambulance.status === 'ARRIVED') {
      // Simulation finished
      return;
    }

    // 1. Move Ambulance
    // Distance decreases towards 0
    if (ambulance.eta > 0) {
      ambulance.eta -= 1;
      
      // Interpolate position from [90,90] -> patient [10,10] then -> hospital [50,50]
      // For simplicity, we just move it directly to hospital if it's already with patient
      let targetLoc = patient.status === 'AWAITING_AMBULANCE' ? patient.location : hospital.location;
      
      let [ax, ay] = ambulance.location;
      let [tx, ty] = targetLoc;

      let dx = tx - ax;
      let dy = ty - ay;

      // Move 5% towards target each tick
      ax += dx * 0.1;
      ay += dy * 0.1;

      ambulance.location = [ax, ay];

      // If close to patient
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001 && patient.status === 'AWAITING_AMBULANCE') {
        patient.status = 'IN_TRANSIT';
        ambulance.eta += 15; // Reset ETA for the hospital trip
      }

      // If close to hospital
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001 && patient.status === 'IN_TRANSIT') {
        patient.status = 'DELIVERED';
        ambulance.status = 'ARRIVED';
        ambulance.eta = 0;
      }
    }

    // 2. Simulate Vitals
    if (patient.vitals) {
        // Random fluctuation
        let hrModifier = (Math.random() - 0.5) * 4; 
        patient.vitals.heartRate = Math.max(40, Math.min(200, patient.vitals.heartRate + hrModifier));
        
        let o2Modifier = (Math.random() - 0.2) * 2;
        patient.vitals.oxygen = Math.max(50, Math.min(100, patient.vitals.oxygen + o2Modifier));
    }

    State.setState({ patient, ambulance });

    // Emit updates
    if (this.io) {
      this.io.emit('system_update', State.getState());
    }
  }
}

module.exports = new SimulationEngine();
