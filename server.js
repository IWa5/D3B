const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// State for AI
let state = {
  mode: 'auto', // 'auto' or 'manual'
  features: {
    tts: false,
    glitch: true
  }
};

// Admin sockets
let admins = new Set();

app.get('/state', (req, res) => {
  res.json(state);
});

// Socket.IO for admin overrides
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register admin', () => {
    admins.add(socket.id);
    socket.emit('state', state);
  });

  socket.on('update state', (newState) => {
    state = { ...state, ...newState };
    // Broadcast new state to all clients
    io.emit('state update', state);
  });

  socket.on('disconnect', () => {
    admins.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// Optional: AI response endpoint for auto mode
io.on('connection', (socket) => {
  socket.on('user message', (msg) => {
    if (state.mode === 'auto') {
      // simple AI: reverse message
      const reply = ">>> " + msg.split("").reverse().join("");
      socket.emit('ai message', reply);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
