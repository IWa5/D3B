const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Global state
let state = {
  mode: 'auto', // 'auto' or 'manual'
  features: {
    tts: false,
    glitch: true
  }
};

let users = new Map();

// Serve state endpoint (optional)
app.get('/state', (req, res) => res.json(state));

io.on('connection', (socket) => {
  console.log('connected:', socket.id);
  users.set(socket.id, socket);

  // User sends message
  socket.on('user message', (msg) => {
    // Broadcast to admin panel
    io.to('admins').emit('user message', { id: socket.id, msg });

    if (state.mode === 'auto') {
      const reply = ">>> " + msg.split("").reverse().join("");
      socket.emit('ai message', reply);
    }
  });

  // Admin sends message
  socket.on('admin message', ({ targetId, msg }) => {
    if (targetId === 'all') {
      users.forEach((s) => s.emit('ai message', `[ADMIN] ${msg}`));
    } else {
      const target = users.get(targetId);
      if (target) target.emit('ai message', `[ADMIN] ${msg}`);
    }
  });

  // Admin registers
  socket.on('register admin', () => {
    socket.join('admins');
    // Send current users
    socket.emit('connected users', Array.from(users.keys()));
    // Send current state
    socket.emit('state update', state);
  });

  // Admin updates state
  socket.on('update state', (newState) => {
    state = { ...state, ...newState };
    io.emit('state update', state); // send to users and admins
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.to('admins').emit('user disconnected', socket.id);
    console.log('disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
