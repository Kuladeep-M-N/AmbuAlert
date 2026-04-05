const express = require('express');
const router  = express.Router();
const DecisionEngine = require('../services/DecisionEngine');
const State          = require('../models/State');

// POST /emergency — Trigger an emergency
router.post('/emergency', async (req, res) => {
  const result = await DecisionEngine.processEmergency(req.body);
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

module.exports = router;
