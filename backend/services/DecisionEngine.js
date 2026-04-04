const State = require('../models/State');
const Graph = require('../models/Graph');

class DecisionEngine {
  async processEmergency(data) {
    const { type, symptoms, age, impact, no_movement } = data;
    
    // 1. Classification
    let severity = "MEDIUM";
    
    if (type === 'Accident') {
      if (impact > 30 && no_movement) {
        severity = "CRITICAL";
      } else if (impact > 20) {
        severity = "HIGH";
      }
    } else if (type === 'Heart Attack' || type === 'Stroke') {
      severity = "CRITICAL";
    }

    const priority = severity === "CRITICAL" ? 1 : severity === "HIGH" ? 2 : 3;

    // Basavanagudi, BMS College coords (Hospital)
    const baseLat = 12.9415;
    const baseLng = 77.5660;

    const hospLoc = [baseLat, baseLng];

    // 2. Create Patient Digital Twin (within ~1.5km radius)
    const patLat = baseLat + (Math.random() - 0.5) * 0.015;
    const patLng = baseLng + (Math.random() - 0.5) * 0.015;
    const patLoc = [patLat, patLng];

    const patientTwin = {
      id: `PAT-${Math.floor(Math.random() * 10000)}`,
      type: type || 'Unknown',
      severity,
      priority,
      location: patLoc,
      status: 'AWAITING_AMBULANCE',
      vitals: {
        heartRate: type === 'Heart Attack' ? 140 : 85,
        oxygen: type === 'Heart Attack' ? 88 : 98,
        bloodPressure: '120/80',
      }
    };

    // 3. Assign Ambulance (starting further away ~2.5km max)
    const ambLat = baseLat + (Math.random() > 0.5 ? 0.02 : -0.02);
    const ambLng = baseLng + (Math.random() > 0.5 ? 0.02 : -0.02);
    const ambLoc = [ambLat, ambLng];

    // Fetch real routes from OSRM mapping
    const routes = await Graph.findMultipleRoutes(ambLoc, patLoc);
    let bestEta = routes && routes.length ? routes[0].etaMinutes : (severity === "CRITICAL" ? 15 : 25);

    const ambulance = {
      id: `AMB-${Math.floor(Math.random() * 100)}`,
      location: ambLoc,
      eta: bestEta * 60, // Convert to seconds for UI simulation
      currentTargetIdx: 0,
      status: 'DISPATCHED'
    };

    // 4. Select Hospital
    const hospital = {
      id: 'HOSP-1',
      name: 'BMS Hospital Basavanagudi',
      location: hospLoc,
      prepStatus: {
        icuReady: severity === "CRITICAL",
        doctorsReady: true
      }
    };

    // Update global state
    State.setState({
      systemStatus: 'ACTIVE',
      patient: patientTwin,
      ambulance,
      hospital,
      routes: routes || [],
      currentRouteIndex: 0
    });

    return State.getState();
  }
}

module.exports = new DecisionEngine();
