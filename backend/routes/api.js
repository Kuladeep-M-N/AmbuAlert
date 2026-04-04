const express = require('express');
const router = express.Router();
const DecisionEngine = require('../services/DecisionEngine');
const State = require('../models/State');

// POST /emergency - Trigger an emergency
router.post('/emergency', (req, res) => {
  const result = DecisionEngine.processEmergency(req.body);
  res.json({ message: 'Emergency processed', state: result });
});

// GET /status - Get current state
router.get('/status', (req, res) => {
  res.json(State.getState());
});

// POST /decision - Retrieve decision for current case (demo wrapper)
router.post('/decision', (req, res) => {
  const state = State.getState();
  if (state.systemStatus === 'IDLE') {
    return res.status(400).json({ error: 'No active emergency' });
  }
  res.json({ patient: state.patient, ambulance: state.ambulance, hospital: state.hospital });
});

// GET /ambulance
router.get('/ambulance', (req, res) => {
  const state = State.getState();
  res.json(state.ambulance || { status: 'Not assigned' });
});

module.exports = router;
