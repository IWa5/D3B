// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins (adjust for security)
    methods: ['GET', 'POST']
  }
});

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle chat messages
  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server on Render's port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
