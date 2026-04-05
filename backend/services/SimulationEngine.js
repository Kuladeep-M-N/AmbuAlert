const State = require('../models/State');
const Graph = require('../models/Graph');

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

  _loadHospitalRoute(patLoc, hospLoc, dispatchedId) {
    if (this.loadingRoute) return;
    this.loadingRoute = true;

    Graph.findMultipleRoutes(patLoc, hospLoc)
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

        // Start fetching hospital route immediately (non-blocking)
        this._loadHospitalRoute(patient.location, hospital.location, dispatchedAmbulanceId);
      }

    } else if (ambulance.phase === 'PICKUP') {
      // Brief pause — ambulance stays at patient position
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
      }
    }

    // ── Vitals simulation ─────────────────────────────────────────────────
    if (patient.vitals) {
      patient.vitals.heartRate = Math.max(40, Math.min(200,
        patient.vitals.heartRate + (Math.random() - 0.5) * 4));
      patient.vitals.oxygen = Math.max(50, Math.min(100,
        patient.vitals.oxygen + (Math.random() - 0.2) * 2));
    }

    // ── Dynamic Re-Routing Logic (Every 15s) ──────────────────────────────
    if (ambulance.phase === 'IN_TRANSIT') {
      if (!ambulance.rerouteTicks) ambulance.rerouteTicks = 0;
      ambulance.rerouteTicks++;
      
      if (ambulance.rerouteTicks >= 30) { // 30 ticks = 15 seconds
        console.log('🔄 AI Re-Route Triggered: Optimizing Green Corridor...');
        this._loadHospitalRoute(ambulance.location, hospital.location, dispatchedAmbulanceId);
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
      activeSignalOverrides 
    });

    if (this.io) {
      this.io.emit('system_update', State.getState());
    }
  }
}

module.exports = new SimulationEngine();
