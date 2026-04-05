const express = require('express');
const router  = express.Router();
const DecisionEngine = require('../services/DecisionEngine');
const State          = require('../models/State');

module.exports = (io) => {
  // POST /emergency — Trigger an emergency
  router.post('/emergency', async (req, res) => {
    const result = await DecisionEngine.processEmergency(req.body);
    
    // BROADCAST: Let all clients (LiveResponse, Metaverse) know we are PENDING acceptance
    if (io) io.emit('system_update', State.getState());
    
    res.json({ message: 'Emergency processed', state: result });
  });

  // GET /status — Get current state
  router.get('/status', (req, res) => {
    res.json(State.getState());
  });

  // POST /decision — Decision summary
  router.post('/decision', (req, res) => {
    const state = State.getState();
    if (state.systemStatus === 'IDLE') {
      return res.status(400).json({ error: 'No active emergency' });
    }
    const dispatched = state.ambulances?.find(a => a.id === state.dispatchedAmbulanceId);
    res.json({
      patient:              state.patient,
      dispatchedAmbulance:  dispatched,
      allAmbulances:        state.ambulances,
      hospital:             state.hospital,
    });
  });

  // GET /ambulances — Return full fleet
  router.get('/ambulances', (req, res) => {
    res.json(State.getState().ambulances || []);
  });

  // POST /accept-dispatch — Manual acceptance
  router.post('/accept-dispatch', async (req, res) => {
    const { ambulanceId } = req.body;
    const state = State.getState();
    const Graph = require('../models/Graph');

    if (state.systemStatus !== 'PENDING') {
      return res.status(400).json({ error: 'System is not in PENDING state' });
    }

    const ambulance = state.ambulances?.find(a => a.id === ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }

    console.log(`🚑 Unit ${ambulanceId} accepted mission. Initializing Live Dispatch...`);

    // Calculate routes now that we have a driver locked-in
    const routes = await Graph.findMultipleRoutes(ambulance.location, state.patient.location);
    if (routes && routes.length > 0) {
      routes[0].coordinates = Graph.densifyRoute(routes[0].coordinates);
    }
    
    // Set first ETA
    const finalAmbs = state.ambulances.map(a => {
      if (a.id === ambulanceId && routes && routes.length > 0) {
        return { ...a, eta: Math.round(routes[0].etaMinutes * 60) };
      }
      return a;
    });

    const updatedState = {
      systemStatus: 'ACTIVE',
      dispatchedAmbulanceId: ambulanceId,
      pendingAmbulanceOffers: [], // Clear offers
      ambulances: finalAmbs,
      routes
    };

    State.setState(updatedState);
    
    // BROADCAST: Activate simulation across all screens
    if (io) io.emit('system_update', State.getState());
    
    res.json({ message: 'Mission Accepted', state: updatedState });
  });

  return router;
};
