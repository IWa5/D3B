const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Store user sockets for admin
let users = new Map();

// Simple AI response function
function aiResponse(message) {
  // Example AI logic: just echoes with "D3B says:"
  return `D3B: I heard you say "${message}"`;
}

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  users.set(socket.id, socket);

  socket.on('user message', (msg) => {
    // Send user message to admin dashboard
    io.to('admins').emit('user message', { id: socket.id, msg });

    // AI automatic response
    const reply = aiResponse(msg);
    socket.emit('ai message', reply);
  });

  socket.on('admin message', ({ targetId, msg }) => {
    if (targetId === 'all') {
      // Broadcast to all users
      users.forEach((s) => s.emit('ai message', `[ADMIN] ${msg}`));
    } else {
      const target = users.get(targetId);
      if (target) target.emit('ai message', `[ADMIN] ${msg}`);
    }
  });

  socket.on('register admin', () => {
    socket.join('admins');
    // Send current connected users
    socket.emit('connected users', Array.from(users.keys()));
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    users.delete(socket.id);
    io.to('admins').emit('user disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
