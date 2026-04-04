const State = require('../models/State');

class DecisionEngine {
  processEmergency(data) {
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

    // Base Bengaluru coords (Hospital)
    const baseLat = 12.9716;
    const baseLng = 77.5946;

    // 2. Create Patient Digital Twin
    const patLat = baseLat + (Math.random() - 0.5) * 0.05;
    const patLng = baseLng + (Math.random() - 0.5) * 0.05;

    const patientTwin = {
      id: `PAT-${Math.floor(Math.random() * 10000)}`,
      type: type || 'Unknown',
      severity,
      priority,
      location: [patLat, patLng],
      status: 'AWAITING_AMBULANCE',
      vitals: {
        heartRate: type === 'Heart Attack' ? 140 : 85,
        oxygen: type === 'Heart Attack' ? 88 : 98,
        bloodPressure: '120/80',
      }
    };

    // 3. Assign Ambulance
    const ambLat = patLat + (Math.random() > 0.5 ? 0.03 : -0.03);
    const ambLng = patLng + (Math.random() > 0.5 ? 0.03 : -0.03);

    const ambulance = {
      id: `AMB-${Math.floor(Math.random() * 100)}`,
      location: [ambLat, ambLng],
      eta: severity === "CRITICAL" ? 15 : 25,
      status: 'DISPATCHED'
    };

    // 4. Select Hospital
    const hospital = {
      id: 'HOSP-1',
      name: 'Bengaluru Central Life Care',
      location: [baseLat, baseLng],
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
      hospital
    });

    return State.getState();
  }
}

module.exports = new DecisionEngine();
