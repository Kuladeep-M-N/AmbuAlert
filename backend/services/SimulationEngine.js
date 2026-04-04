const State = require('../models/State');
const Graph = require('../models/Graph');

class SimulationEngine {
  constructor() {
    this.io = null;
    this.intervalId = null;
    this.trafficUpdateCounter = 0;
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

    let { patient, ambulance, hospital, routes } = state;

    if (ambulance.status === 'ARRIVED') {
      return;
    }

    this.trafficUpdateCounter++;
    
    // Dynamic Traffic Fluctuation every 10 seconds
    if (this.trafficUpdateCounter >= 10 && !this.isUpdatingRoutes) {
      this.trafficUpdateCounter = 0;
      this.isUpdatingRoutes = true;
      Graph.randomizeTraffic();
      
      let targetLoc = patient.status === 'AWAITING_AMBULANCE' ? patient.location : hospital.location;
      
      Graph.findMultipleRoutes(ambulance.location, targetLoc).then(newRoutes => {
         if (newRoutes && newRoutes.length > 0) {
             state.routes = newRoutes;
             // Keep the currentTargetIdx clamped if the new route is shorter
             if (ambulance.currentTargetIdx >= newRoutes[0].coordinates.length) {
                 ambulance.currentTargetIdx = newRoutes[0].coordinates.length - 1;
             }
         }
         this.isUpdatingRoutes = false;
      }).catch(() => {
         this.isUpdatingRoutes = false;
      });
    }

    // 1. Move Ambulance 
    if (ambulance.eta > 0) {
      ambulance.eta -= 1;
      
      // Move along the best route path
      let bestRoute = routes && routes.length > 0 ? routes[0] : null;
      
      if (bestRoute && bestRoute.coordinates && bestRoute.coordinates.length > 0) {
         let currentTargetIdx = ambulance.currentTargetIdx || 0;
         
         if (currentTargetIdx >= bestRoute.coordinates.length) {
            currentTargetIdx = bestRoute.coordinates.length - 1;
         }

         let [cx, cy] = bestRoute.coordinates[currentTargetIdx];
         let [ax, ay] = ambulance.location;
         
         let dx = cx - ax;
         let dy = cy - ay;
         let distToTarget = Math.sqrt(dx*dx + dy*dy);
         
         // If very close to current node in path, target the next node
         if (distToTarget < 0.0002) {
             currentTargetIdx++;
             if (currentTargetIdx < bestRoute.coordinates.length) {
                 cx = bestRoute.coordinates[currentTargetIdx][0];
                 cy = bestRoute.coordinates[currentTargetIdx][1];
                 dx = cx - ax;
                 dy = cy - ay;
             }
         }
         
         ambulance.currentTargetIdx = currentTargetIdx;
         
         // Move along the vector
         let step = 0.0003; // Smoothing factor
         let length = Math.sqrt(dx*dx + dy*dy);
         
         if (length > step) {
             ax += (dx/length) * step;
             ay += (dy/length) * step;
         } else {
             ax = cx; 
             ay = cy;
         }
         
         ambulance.location = [ax, ay];
      }

      // Check reaching patient
      let distToPatient = Graph.calcDistance(ambulance.location[0], ambulance.location[1], patient.location[0], patient.location[1]);
      if (distToPatient < 0.1 && patient.status === 'AWAITING_AMBULANCE') {
        patient.status = 'IN_TRANSIT';
        ambulance.currentTargetIdx = 0; // reset for next trip
        
        Graph.findMultipleRoutes(patient.location, hospital.location).then(newRoutes => {
             if (newRoutes && newRoutes.length > 0) {
                 state.routes = newRoutes;
                 ambulance.eta = newRoutes[0].etaMinutes * 60; 
             }
        });
      }

      // Check reaching hospital
      let distToHospital = Graph.calcDistance(ambulance.location[0], ambulance.location[1], hospital.location[0], hospital.location[1]);
      if (distToHospital < 0.2 && patient.status === 'IN_TRANSIT') {
        patient.status = 'DELIVERED';
        ambulance.status = 'ARRIVED';
        ambulance.eta = 0;
      }
    }

    // 2. Simulate Vitals
    if (patient.vitals) {
        let hrModifier = (Math.random() - 0.5) * 4; 
        patient.vitals.heartRate = Math.max(40, Math.min(200, patient.vitals.heartRate + hrModifier));
        
        let o2Modifier = (Math.random() - 0.2) * 2;
        patient.vitals.oxygen = Math.max(50, Math.min(100, patient.vitals.oxygen + o2Modifier));
    }

    State.setState({ patient, ambulance, routes: state.routes });

    if (this.io) {
      this.io.emit('system_update', State.getState());
    }
  }
}

module.exports = new SimulationEngine();
