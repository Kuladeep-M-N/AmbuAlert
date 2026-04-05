const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const SimulationEngine = require('./services/SimulationEngine');
const State = require('./models/State');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Send initial state
  socket.emit('system_update', State.getState());
  
  // Custom reset for dev
  socket.on('reset_simulation', () => {
    State.resetState();
    io.emit('system_update', State.getState());
  });

  socket.on('metaverse_enter', (data) => {
    const s = State.getState();
    const incidents = (s.patient && s.patient.location) ? [s.patient] : [];
    socket.emit('metaverse_scene_load', {
      ambulances: s.ambulances || [],
      incidents: incidents,
      hospitals: s.hospital ? [s.hospital] : []
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

SimulationEngine.setIo(io);
SimulationEngine.start();

// Metaverse 30FPS stream
setInterval(() => {
  const s = State.getState();
  if (!s || !s.ambulances) return;
  const incidents = (s.patient && s.patient.location && s.patient.status !== 'DELIVERED') ? [s.patient] : [];
  io.emit('metaverse_position_update', {
    ambulances: s.ambulances,
    incidents: incidents
  });
}, 33);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
