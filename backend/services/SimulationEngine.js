const State = require('../models/State');
const Graph = require('../models/Graph');
const DecisionEngine = require('./DecisionEngine');

/**
 * SimulationEngine — tick-based ambulance movement
 *
 * Phase 1: DISPATCHED  → ambulance moves to patient   (routes = amb→patient)
 * Phase 2: PICKUP      → 1-sec pause at patient spot  (simulate boarding)
 * Phase 3: IN_TRANSIT  → ambulance moves to hospital  (routes = patient→hospital)
 * Phase 4: ARRIVED     → simulation done
 *
 * Key design decisions:
 *  - `phase` is stored directly on the ambulance object so it survives across ticks
 *  - Route loading is guarded by `loadingRoute` flag; ambulance NEVER stops while route loads
 *  - Movement always uses routes[0] (optimal / lowest-cost path from OSRM score sort)
 *  - eta is a countdown in ticks (500ms each); never blocks movement
 */

const STEP     = 0.0005;   // ~55 m per tick at 500 ms interval (≈ 40 km/h sim speed)
const SNAP_THR = 0.0002;   // distance threshold to advance to next waypoint
const PAT_THR  = 0.05;     // km — reach-patient radius
const HOSP_THR = 0.05;     // km — reach-hospital radius
const PICKUP_TICKS = 6;    // 3 seconds pause for patient pickup (6 × 500 ms)

class SimulationEngine {
  constructor() {
    this.io           = null;
    this.intervalId   = null;
    this.loadingRoute = false;   // prevents double OSRM fetches
    this.pickupTimer  = 0;       // countdown ticks for pickup pause
    this.capacityJitterTicks = 0; 
  }

  setIo(io) { this.io = io; }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), 500);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  _writeAmb(ambulance, dispatchedId) {
    // Directly mutate the ambulances array in State so changes are immediately visible
    const state = State.getState();
    const i = state.ambulances.findIndex(a => a.id === dispatchedId);
    if (i !== -1) state.ambulances[i] = { ...state.ambulances[i], ...ambulance };
  }

  _loadHospitalRoute(patLoc, hospLoc, dispatchedId, severity = 'ROUTINE') {
    if (this.loadingRoute) return;
    this.loadingRoute = true;

    Graph.findMultipleRoutes(patLoc, hospLoc, severity)
      .then(newRoutes => {
        if (newRoutes && newRoutes.length > 0) {
          // Use shared utility for smooth movement
          newRoutes[0].coordinates = Graph.densifyRoute(newRoutes[0].coordinates);
          
          const state = State.getState();
          state.routes = newRoutes;

          const i = state.ambulances.findIndex(a => a.id === dispatchedId);
          if (i !== -1) {
            state.ambulances[i].currentTargetIdx = 0;
            state.ambulances[i].eta = Math.round(newRoutes[0].etaMinutes * 60);
            state.ambulances[i].phase = 'IN_TRANSIT';
          }

          state.patient.status = 'IN_TRANSIT';
        }
        this.loadingRoute = false;
      })
      .catch(err => {
        console.error('Hospital route fetch error:', err);
        this.loadingRoute = false;
      });
  }

  // ── Move ambulance along current routes[0] ───────────────────────────────

  _moveAlongRoute(ambulance, routes) {
    const bestRoute = routes && routes.length > 0 ? routes[0] : null;
    if (!bestRoute || !bestRoute.coordinates || bestRoute.coordinates.length === 0) return ambulance;

    let idx = ambulance.currentTargetIdx || 0;
    const coords = bestRoute.coordinates;

    if (idx >= coords.length) {
      // Reached end of route — clamp
      ambulance.location = [...coords[coords.length - 1]];
      return ambulance;
    }

    let [cx, cy] = coords[idx];
    let [ax, ay] = ambulance.location;
    let dx = cx - ax, dy = cy - ay;

    // Snap to waypoint if very close, advance to next
    if (Math.sqrt(dx * dx + dy * dy) < SNAP_THR) {
      idx++;
      if (idx < coords.length) {
        [cx, cy] = coords[idx];
        dx = cx - ax;
        dy = cy - ay;
      }
    }

    ambulance.currentTargetIdx = idx;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > STEP) {
      ax += (dx / length) * STEP;
      ay += (dy / length) * STEP;
      ambulance.location = [ax, ay];
    } else {
      // Snap exactly to waypoint, advance
      ambulance.location = [cx, cy];
      ambulance.currentTargetIdx = idx + 1;
    }

    return ambulance;
  }

  // ── Main tick ─────────────────────────────────────────────────────────────

  tick() {
    const state = State.getState();
    if (state.systemStatus !== 'ACTIVE') return;

    // Always read the freshest ambulances array
    const { patient, dispatchedAmbulanceId, hospital } = state;
    const routes = state.routes;

    if (!state.ambulances || !dispatchedAmbulanceId) return;

    let lastCompletedCase = null;

    const ambIdx = state.ambulances.findIndex(a => a.id === dispatchedAmbulanceId);
    if (ambIdx === -1) return;

    // Work on a mutable copy
    let ambulance = { ...state.ambulances[ambIdx] };

    if (ambulance.status === 'ARRIVED') return;

    // Initialise phase if missing (first tick after dispatch)
    if (!ambulance.phase) ambulance.phase = 'DISPATCHED';

    // ── ETA countdown (for display only — does NOT gate movement) ──────────
    if (ambulance.eta > 0) ambulance.eta -= 1;

    // ── STATE MACHINE ────────────────────────────────────────────────────────

    if (ambulance.phase === 'DISPATCHED') {
      // Move toward patient
      ambulance = this._moveAlongRoute(ambulance, routes);

      const distPat = Graph.calcDistance(
        ambulance.location[0], ambulance.location[1],
        patient.location[0],   patient.location[1]
      );

      if (distPat < PAT_THR) {
        // Snap exactly to patient
        ambulance.location         = [...patient.location];
        ambulance.phase            = 'PICKUP';
        ambulance.currentTargetIdx = 0;
        this.pickupTimer           = PICKUP_TICKS;
        // Reflect handoff to transport immediately for hospital-side intake updates.
        patient.status             = 'IN_AMBULANCE';

        // Start fetching hospital route immediately (non-blocking)
        this._loadHospitalRoute(patient.location, hospital.location, dispatchedAmbulanceId, patient.severity);
      }

    } else if (ambulance.phase === 'PICKUP') {
      // Brief pause — ambulance stays at patient position
      if (patient.status !== 'IN_AMBULANCE') patient.status = 'IN_AMBULANCE';
      this.pickupTimer--;

      if (this.pickupTimer <= 0 && !this.loadingRoute) {
        // Route is ready, transition to IN_TRANSIT
        // (phase is set to IN_TRANSIT inside _loadHospitalRoute callback)
        // Safety: if somehow still here, nudge to IN_TRANSIT
        ambulance.phase  = 'IN_TRANSIT';
        patient.status   = 'IN_TRANSIT';
      }

    } else if (ambulance.phase === 'IN_TRANSIT') {
      // patient.status must be IN_TRANSIT
      if (patient.status !== 'IN_TRANSIT') patient.status = 'IN_TRANSIT';

      // Move toward hospital
      ambulance = this._moveAlongRoute(ambulance, routes);

      const distHosp = Graph.calcDistance(
        ambulance.location[0], ambulance.location[1],
        hospital.location[0],  hospital.location[1]
      );

      if (distHosp < HOSP_THR) {
        ambulance.location = [...hospital.location];
        ambulance.phase    = 'ARRIVED';
        ambulance.status   = 'ARRIVED';
        ambulance.eta      = 0;
        patient.status     = 'DELIVERED';

        lastCompletedCase = {
          patientId: patient.id,
          type: patient.type,
          severity: patient.severity,
          hospitalName: hospital.name,
          hospitalSpec: hospital.spec,
          ambulanceId: ambulance.id,
          deliveredAt: new Date().toISOString()
        };
      }
    }

    // ── Vitals simulation ─────────────────────────────────────────────────
    if (patient.vitals) {
      patient.vitals.heartRate = Math.max(40, Math.min(200,
        patient.vitals.heartRate + (Math.random() - 0.5) * 4));
      patient.vitals.oxygen = Math.max(50, Math.min(100,
        patient.vitals.oxygen + (Math.random() - 0.2) * 2));
    }

    // ── AI Self-Healing: Mid-Mission Clinical Pivot logic (Every 30s) ──
    if (ambulance.phase === 'IN_TRANSIT' && !this.loadingRoute) {
      if (!ambulance.pivotTicks) ambulance.pivotTicks = 0;
      ambulance.pivotTicks++;

      if (ambulance.pivotTicks >= 60) { // 60 ticks = 30 seconds
        const currentHospId = hospital.id;
        
        // Re-analyze regional grid for the specific patient modality
        const symptoms = (patient.type || '').toUpperCase();
        const isCardiac = symptoms.includes('HEART') || symptoms.includes('CHEST') || symptoms.includes('V-FIB');
        const isTrauma  = symptoms.includes('ACCIDENT') || symptoms.includes('COLLISION') || symptoms.includes('FALL');
        const isPed     = symptoms.includes('PEDIATRIC') || symptoms.includes('CHILD');
        const isBurn    = symptoms.includes('FIRE') || symptoms.includes('BURN');
        const prioritySpec = isCardiac ? 'CARDIAC' : (isTrauma ? 'TRAUMA' : (isPed ? 'PEDIATRIC' : (isBurn ? 'BURN' : 'GENERAL')));

        const currentScoreArr = DecisionEngine.scoreHospitals(ambulance.location, prioritySpec);
        const bestNew = currentScoreArr.sort((a,b) => parseFloat(a.currentScore) - parseFloat(b.currentScore))[0];
        const currentHospScore = currentScoreArr.find(h => h.id === currentHospId)?.currentScore || 999;

        // "Self-Healing" Pivot locked only if 20% clinical improvement detected
        if (bestNew.id !== currentHospId && (parseFloat(bestNew.currentScore) < parseFloat(currentHospScore) * 0.8)) {
           console.log(`📡 AI Self-Healing PIVOT: Rerouting ${ambulance.id} from ${hospital.name} to ${bestNew.name}...`);
           
           // Perform mid-mission state pivot
           state.hospital = {
              ...bestNew,
              distanceStr: `${bestNew.dist} km`,
              selectionReason: `AI Self-Healing: Dynamic capacity shift identified better clinical outcome at ${bestNew.name}.`
           };
           state.hospitals = currentScoreArr; 
           this._loadHospitalRoute(ambulance.location, bestNew.location, dispatchedAmbulanceId, patient.severity);
           
           if (this.io) {
             this.io.emit('SYSTEM_PIVOT', {
                reason: `Dynamic Capacity Shift: Specialty affinity at ${bestNew.name} is now superior.`,
                oldHospId: currentHospId,
                newHospId: bestNew.id
             });
           }
        }
        ambulance.pivotTicks = 0;
      }
    }

    // ── Capacity Jitter Logic (Every 10s simulation of urban variance) ──
    this.capacityJitterTicks++;
    if (this.capacityJitterTicks >= 20) {
       DecisionEngine.hospitals.forEach(h => {
          const shift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          h.availableBeds = Math.max(0, Math.min(h.totalBeds, h.availableBeds + shift));
       });
       this.capacityJitterTicks = 0;
    }

    // ── Dynamic Re-Routing Logic (Every 15s for map consistency) ──────────────
    if (ambulance.phase === 'IN_TRANSIT') {
      if (!ambulance.rerouteTicks) ambulance.rerouteTicks = 0;
      ambulance.rerouteTicks++;
      
      if (ambulance.rerouteTicks >= 30) { // 30 ticks = 15 seconds
        console.log(`🔄 AI Re-Route Triggered [${ambulance.id}]: Optimizing for ${patient.severity} patient...`);
        this._loadHospitalRoute(ambulance.location, hospital.location, dispatchedAmbulanceId, patient.severity);
        ambulance.rerouteTicks = 0;
      }
    }

    // ── Green Corridor: Signal Override Logic ─────────
    const activeSignalOverrides = [];
    const rootRoute = state.routes && state.routes[0];
    if (rootRoute && rootRoute.signalNodes) {
      rootRoute.signalNodes.forEach(node => {
        const d = Graph.calcDistance(
          ambulance.location[0], ambulance.location[1],
          node[0], node[1]
        );
        if (d < 0.2) { // 200m preemption radius
          activeSignalOverrides.push(node);
        }
      });
    }

    // ── Write updated state ──────────────────────────
    const updatedAmbs = state.ambulances.map(a =>
      a.id === dispatchedAmbulanceId ? ambulance : a
    );

    State.setState({ 
      patient, 
      ambulances: updatedAmbs,
      activeSignalOverrides,
      ...(lastCompletedCase ? { lastCompletedCase } : {})
    });

    if (this.io) {
      this.io.emit('system_update', State.getState());
    }
  }
}

module.exports = new SimulationEngine();
