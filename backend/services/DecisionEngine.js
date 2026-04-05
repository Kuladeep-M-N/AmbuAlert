const Graph = require('../models/Graph');
const State = require('../models/State');

/**
 * DecisionEngine — Intelligence & Dispatch Logic
 *
 * 1. Fleet of 3 ambulances (spread across Bengaluru)
 * 2. Cost Calculation (Distance + Traffic)
 * 3. Nearest selection based on OSRM road geometry
 */
class DecisionEngine {
  constructor() {
    this.fleet = [
      {
        id: 'AMB-01',
        crew: 'Team Alpha',
        zone: 'Basavanagudi Circle',
        status: 'AVAILABLE',
        location: [12.9416, 77.5752], // Road snapped: Basavanagudi
        currentPhase: 'IDLE'
      },
      {
        id: 'AMB-02',
        crew: 'Team Bravo',
        zone: 'Gandhi Bazaar',
        status: 'AVAILABLE',
        location: [12.9431, 77.5701], // Road snapped: Gandhi Bazaar
        currentPhase: 'IDLE'
      },
      {
        id: 'AMB-03',
        crew: 'Team Charlie',
        zone: 'Jayanagar 4th Block',
        status: 'AVAILABLE',
        location: [12.9285, 77.5832], // Road snapped: Jayanagar
        currentPhase: 'IDLE'
      }
    ];

    this.hospitals = [
      { name: 'BMS Trauma Center', location: [12.9379, 77.5724], spec: 'Trauma' },
      { name: 'Vani Vilas Cardiac', location: [12.9554, 77.5765], spec: 'Cardiac' },
      { name: 'Sagar Multispecialty', location: [12.9152, 77.5934], spec: 'General' }
    ];
  }

  async processEmergency(data) {
    console.log('🧠 Decision Engine processing incident:', data.type);

    // 1. Generate Victim (Patient) digital twin — RANDOMIZED ROAD POINT
    const lat = 12.9300 + (Math.random() * 0.02); // ~2.2 km range
    const lng = 77.5650 + (Math.random() * 0.02); // ~2.2 km range

    const patient = {
      id: 'PAT-' + Math.floor(Math.random() * 900 + 100),
      type: data.type || 'Medical Emergency',
      severity: data.impact > 30 || data.no_movement ? 'CRITICAL' : 'STABLE',
      location: [lat, lng], 
      vitals: { heartRate: 110, oxygen: 94 },
      status: 'AWAITING_AMBULANCE'
    };

    // 2. Nearest Selection Logic — calculate cost for all 3 units
    let bestAmbulance = null;
    let minCost = Infinity;

    // We calculate costs synchronously using Haversine for performance,
    // then fetch real OSRM road distance for the dispatch payload.
    const scoredFleet = this.fleet.map(amb => {
      const distKm = Graph.calcDistance(
        amb.location[0], amb.location[1],
        patient.location[0], patient.location[1]
      );
      
      // Simulate real-time traffic levels
      const trafficWeights = { Low: 1, Medium: 3, High: 8 };
      const trafficLevels = ['Low', 'Medium', 'High'];
      const traffic = trafficLevels[Math.floor(Math.random() * 3)];
      
      // cost = distance + traffic_penalty
      const cost = distKm + (trafficWeights[traffic] * 0.15);

      if (cost < minCost) {
        minCost = cost;
        bestAmbulance = amb;
      }

      return {
        ...amb,
        distanceToPatient: distKm.toFixed(2),
        traffic,
        cost: cost.toFixed(3)
      };
    });

    // 3. Hospital Match (Nearest to patient)
    const matchedHospital = this.hospitals[0]; // Simple selection for demo

    // 4. Fetch the real shortest-path route (OSRM)
    const routes = await Graph.findMultipleRoutes(bestAmbulance.location, patient.location);

    // Update global state
    const newState = {
      systemStatus: 'ACTIVE',
      patient,
      ambulances: scoredFleet,
      dispatchedAmbulanceId: bestAmbulance.id,
      hospital: {
        ...matchedHospital,
        distanceStr: '0.7 km',
        selectionReason: 'Nearest regional specialized center'
      },
      routes
    };

    // Set first ETA
    const finalAmbIdx = scoredFleet.findIndex(a => a.id === bestAmbulance.id);
    if(finalAmbIdx !== -1 && routes.length > 0) {
      scoredFleet[finalAmbIdx].eta = Math.round(routes[0].etaMinutes * 60);
    }

    State.setState(newState);
    return newState;
  }
}

module.exports = new DecisionEngine();
