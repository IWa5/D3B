const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let state = {
  mode: "auto",
  features: { tts: false, glitch: true }
};

let users = new Map();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);
  users.set(socket.id, socket);

  // Send current state to this socket
  socket.emit("state update", state);

  // Admin registers
  socket.on("register admin", () => {
    socket.join("admins");
    socket.emit("connected users", Array.from(users.keys()));
  });

  // Admin updates state
  socket.on("update state", (newState) => {
    state = { ...state, ...newState };
    io.emit("state update", state);
  });

  // User sends message
  socket.on("user message", (msg) => {
    // Broadcast to admin
    io.to("admins").emit("user message", { id: socket.id, msg });

    if (state.mode === "auto") {
      const reply = ">>> " + msg.split("").reverse().join("");
      socket.emit("ai message", reply);
    }
  });

  // Admin sends message
  socket.on("admin message", ({ targetId, msg }) => {
    if (targetId === "all") {
      users.forEach((s) => s.emit("ai message", `[ADMIN] ${msg}`));
    } else {
      const target = users.get(targetId);
      if (target) target.emit("ai message", `[ADMIN] ${msg}`);
    }
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.to("admins").emit("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
