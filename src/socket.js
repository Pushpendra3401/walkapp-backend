// src/socket.js
const setupSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const walkers = {};

  io.on("connection", (socket) => {
    console.log("👟 Walker connected:", socket.id);

    socket.on("sendLocation", (data) => {
      if (data && data.lat && data.lng) {
        walkers[socket.id] = { lat: data.lat, lng: data.lng };
        socket.broadcast.emit("walkerUpdate", {
          lat: data.lat,
          lng: data.lng,
          id: socket.id,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("🚪 Walker disconnected:", socket.id);
      delete walkers[socket.id];
      io.emit("walkerLeft", { id: socket.id });
    });
  });

  return io;
};

module.exports = setupSocket;
