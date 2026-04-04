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

    // Basavanagudi, BMS College coords (Hospital bounds center)
    const baseLat = 12.9415;
    const baseLng = 77.5660;

    // 2. Create Patient Digital Twin (within ~1.5km radius)
    const patLat = baseLat + (Math.random() - 0.5) * 0.015;
    const patLng = baseLng + (Math.random() - 0.5) * 0.015;
    const patLoc = [patLat, patLng];

    const patientTwin = {
      id: `PAT-${Math.floor(Math.random() * 1000)}`,
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

    // 3. Smart Hospital Selection Library
    const hospitals = [
      { id: 'HOSP-1', name: 'BMS Trauma Center', location: [12.9400, 77.5650], spec: 'Trauma', cap: 0.8 }, // 80% Full
      { id: 'HOSP-2', name: 'Srinivasa Cardiac Care', location: [12.9350, 77.5680], spec: 'Cardiac', cap: 0.4 },
      { id: 'HOSP-3', name: 'Basavanagudi General', location: [12.9450, 77.5720], spec: 'General', cap: 0.6 },
      { id: 'HOSP-4', name: 'Victoria Govt Hospital', location: [12.9630, 77.5740], spec: 'Trauma', cap: 0.95 },
    ];

    let selectedHospital = null;
    let selectionReason = "";

    // Math calculation for raw Euclidean distance comparison
    const distCalc = (hLoc) => Math.sqrt(Math.pow(hLoc[0] - patLoc[0], 2) + Math.pow(hLoc[1] - patLoc[1], 2));

    if (severity === "CRITICAL") {
      let traumas = hospitals.filter(h => h.spec === 'Trauma' || h.spec === 'Cardiac');
      // Sort by closest trauma/cardiac that is not entirely full (> 90%)
      traumas = traumas.filter(h => h.cap < 0.9).sort((a,b) => distCalc(a.location) - distCalc(b.location));
      if (traumas.length > 0) {
          selectedHospital = traumas[0];
          selectionReason = `Nearest specialized ${selectedHospital.spec} facility with available ICU capacity overrode general centers.`;
      }
    } 
    
    if (!selectedHospital && severity === "HIGH") {
       // Balanced approach: factor Distance + Capacity
       let candidates = [...hospitals].sort((a,b) => {
           let scoreA = distCalc(a.location) * (1 + a.cap);
           let scoreB = distCalc(b.location) * (1 + b.cap);
           return scoreA - scoreB;
       });
       selectedHospital = candidates[0];
       selectionReason = "AI optimized for balanced bed availability and minimal travel time due to High severity.";
    }

    if (!selectedHospital) { // "MEDIUM" or fallback
       let nearest = [...hospitals].sort((a,b) => distCalc(a.location) - distCalc(b.location));
       selectedHospital = nearest[0];
       selectionReason = "Nearest regional general hospital selected for non-critical stabilization.";
    }

    selectedHospital.prepStatus = {
        icuReady: severity === "CRITICAL",
        doctorsReady: true
    };
    selectedHospital.selectionReason = selectionReason;
    selectedHospital.distanceStr = (distCalc(selectedHospital.location) * 111).toFixed(1) + " km";

    // 4. Assign Ambulance (starting further away ~2.5km max)
    const ambLat = baseLat + (Math.random() > 0.5 ? 0.02 : -0.02);
    const ambLng = baseLng + (Math.random() > 0.5 ? 0.02 : -0.02);
    const ambLoc = [ambLat, ambLng];

    // Fetch real routes from OSRM mapping using patient as target 1 (then SimulationEngine does Pat->Hosp)
    const routes = await Graph.findMultipleRoutes(ambLoc, patLoc);
    let bestEta = routes && routes.length ? routes[0].etaMinutes : (severity === "CRITICAL" ? 15 : 25);

    // *CRITICAL SNAP MECHANIC*: Lock abstract mathematical elements solidly onto the strict road nodes!
    if (routes && routes.length > 0 && routes[0].coordinates.length > 0) {
        patientTwin.location = routes[0].coordinates[routes[0].coordinates.length - 1];
        
        // Also ensure Hospital is natively traced for Part 2 continuity
        const hospRoutes = await Graph.findMultipleRoutes(patientTwin.location, selectedHospital.location);
        if (hospRoutes && hospRoutes.length > 0 && hospRoutes[0].coordinates.length > 0) {
            selectedHospital.location = hospRoutes[0].coordinates[hospRoutes[0].coordinates.length - 1];
        }
    }

    const ambulance = {
      id: `AMB-${Math.floor(Math.random() * 100)}`,
      location: routes && routes.length > 0 ? routes[0].coordinates[0] : ambLoc, // Snap strictly
      eta: bestEta * 60, // Convert to seconds for UI simulation
      currentTargetIdx: 0,
      status: 'DISPATCHED'
    };

    // Update global state
    State.setState({
      systemStatus: 'ACTIVE',
      patient: patientTwin,
      ambulance,
      hospital: selectedHospital,
      routes: routes || [],
      currentRouteIndex: 0
    });

    return State.getState();
  }
}

module.exports = new DecisionEngine();
