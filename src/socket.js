module.exports = (io) => {
  const walkers = new Map();

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Identify role and user
    socket.on("identify", (payload) => {
      try {
        if (payload?.type === "walker" && payload.userId) {
          walkers.set(payload.userId.toString(), socket.id);
          console.log(`↪ Walker ${payload.userId} registered`);
        }
      } catch (err) {
        console.warn("identify error", err);
      }
    });

    // Walker location updates
    socket.on("walkerLocation", (data) => {
      io.emit("walkerLocation", data);
    });

    // Request nearby walkers
    socket.on("requestNearby", (data) => {
      io.emit("nearbyWalkers", data);
    });

    // Chat messages
    socket.on("chatMessage", (msg) => {
      io.emit("chatMessage", msg);
    });

    // Typing indicator
    socket.on("typing", (payload) => {
      io.emit("typing", payload);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      for (const [userId, sid] of walkers.entries()) {
        if (sid === socket.id) walkers.delete(userId);
      }
    });
  });
};
