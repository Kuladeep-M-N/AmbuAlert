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
app.use('/api', apiRoutes(io));

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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

SimulationEngine.setIo(io);
SimulationEngine.start();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
