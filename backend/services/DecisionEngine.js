const Graph = require('../models/Graph');
const State = require('../models/State');

/**
 * DecisionEngine — Intelligence & Dispatch Logic
 *
 * 1. Fleet of 3 ambulances (spread across Bengaluru)
 * 2. Cost Calculation (Distance + Traffic)
 * 3. Nearest selection based on OSRM road geometry
 * 4. Multi-Hospital Strategy (Specialty matching)
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
      { id: 'HOSP-01', name: 'Narayana Cardiac Center', location: [12.9554, 77.5765], spec: 'CARDIAC', totalBeds: 15, availableBeds: 12, trafficFactor: 1.1 },
      { id: 'HOSP-02', name: 'BMS Trauma Specialty', location: [12.9379, 77.5724], spec: 'TRAUMA', totalBeds: 10, availableBeds: 8, trafficFactor: 1.4 },
      { id: 'HOSP-03', name: 'Victoria General', location: [12.9645, 77.5768], spec: 'GENERAL', totalBeds: 30, availableBeds: 24, trafficFactor: 2.1 },
      { id: 'HOSP-04', name: 'Indira Gandhi Pediatric', location: [12.9431, 77.5855], spec: 'PEDIATRIC', totalBeds: 18, availableBeds: 15, trafficFactor: 1.2 },
      { id: 'HOSP-05', name: 'St. Johns Burn Center', location: [12.9341, 77.6111], spec: 'BURN', totalBeds: 8, availableBeds: 6, trafficFactor: 1.3 }
    ];
  }

  _densifyRoute(coords) {
    if (!coords || coords.length < 2) return coords;
    const dense = [];
    for (let i = 0; i < coords.length - 1; i++) {
        const start = coords[i];
        const end = coords[i + 1];
        dense.push(start);
        const dist = Math.sqrt(Math.pow(end[0]-start[0],2) + Math.pow(end[1]-start[1],2));
        if (dist > 0.001) {
            const steps = Math.ceil(dist / 0.0005);
            for (let s = 1; s < steps; s++) {
                const r = s / steps;
                dense.push([start[0] + (end[0]-start[0])*r, start[1] + (end[1]-start[1])*r]);
            }
        }
    }
    dense.push(coords[coords.length - 1]);
    return dense;
  }

  async processEmergency(data) {
    console.log('🧠 AI Multi-Hospital Dispatch triaging:', data.type);

    // 1. Analyze Patient Condition + Case Classification
    const symptoms = (data.type || '').toUpperCase();
    const isCardiac  = symptoms.includes('HEART') || symptoms.includes('CHEST') || symptoms.includes('V-FIB');
    const isTrauma   = symptoms.includes('ACCIDENT') || symptoms.includes('COLLISION') || symptoms.includes('FALL');
    const isPed      = symptoms.includes('PEDIATRIC') || symptoms.includes('CHILD') || symptoms.includes('OFFSPRING');
    const isBurn     = symptoms.includes('FIRE') || symptoms.includes('BURN') || symptoms.includes('EXPLOSION');
    
    const prioritySpec = isCardiac ? 'CARDIAC' : (isTrauma ? 'TRAUMA' : (isPed ? 'PEDIATRIC' : (isBurn ? 'BURN' : 'GENERAL')));
    
    // 2. Initial Patient Digital Twin — Randomized City Point
    const lat = 12.9300 + (Math.random() * 0.02);
    const lng = 77.5650 + (Math.random() * 0.02);

    // Nuanced severity assignment
    let severity = (data.impact > 30 || data.no_movement || isCardiac || isBurn) ? 'CRITICAL' : 'ROUTINE';
    if (data.type === 'Accident' || data.impact > 20) {
      if (severity !== 'CRITICAL') severity = 'MAJOR';
    }

    const patient = {
      id: 'PAT-' + Math.floor(Math.random() * 900 + 100),
      type: data.type || 'Medical Emergency',
      severity,
      location: [lat, lng], 
      vitals: { 
        heartRate: isCardiac ? 145 : 85, 
        oxygen: (isTrauma || isBurn) ? 88 : 96 
      },
      status: 'AWAITING_AMBULANCE'
    };

    // 3. AI Multi-Hospital Scoring Logic
    const scoredHospitals = this.scoreHospitals(patient.location, prioritySpec);
    const bestHospital = scoredHospitals.sort((a,b) => parseFloat(a.currentScore) - parseFloat(b.currentScore))[0];

    // 4. Soft Reservation Logic
    if (bestHospital && bestHospital.availableBeds > 0) {
      bestHospital.availableBeds -= 1;
    }

    // 5. Fleet Analysis
    const scoredFleet = this.fleet.map(amb => {
      const distKm = Graph.calcDistance(amb.location[0], amb.location[1], patient.location[0], patient.location[1]);
      const traffic = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
      const cost = distKm + (traffic === 'High' ? 1.5 : (traffic === 'Medium' ? 0.6 : 0.15));
      return { ...amb, distanceToPatient: distKm.toFixed(2), traffic, cost: cost.toFixed(3) };
    });

    // Multi-Unit Broadcast Logic (Top 3 candidate units)
    const candidates = scoredFleet
      .sort((a,b) => parseFloat(a.cost) - parseFloat(b.cost))
      .slice(0, 3);

    const newState = {
      systemStatus: 'PENDING',
      patient,
      ambulances: scoredFleet,
      pendingAmbulanceOffers: candidates,
      hospitals: scoredHospitals, 
      hospital: {
        ...bestHospital,
        distanceStr: `${bestHospital.dist} km`,
        selectionReason: `AI Strategy: Clinical ${bestHospital.spec} facility matched to ${prioritySpec} emergency.`
      },
      routes: [] // Routes calculated upon acceptance
    };

    State.setState(newState);
    return newState;
  }

  scoreHospitals(patientLocation, prioritySpec) {
    return this.hospitals.map(h => {
      const dist = Graph.calcDistance(patientLocation[0], patientLocation[1], h.location[0], h.location[1]);
      const specMatch = h.spec === prioritySpec;
      
      let capacityPenalty = 0;
      if (h.availableBeds <= 0) capacityPenalty = 1000;
      else if (h.availableBeds < 3) capacityPenalty = 5;
      
      const specBonus = specMatch ? 0.6 : 3.0; // High bonus for specialization match
      const score = (dist * 1.5) + (h.trafficFactor * specBonus) + capacityPenalty;
      
      return { ...h, currentScore: score.toFixed(1), dist: dist.toFixed(2) };
    });
  }
}

module.exports = new DecisionEngine();
