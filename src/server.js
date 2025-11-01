const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const path = require('path');
const bookingRoutes = require('./routes/bookings.routes');


dotenv.config();

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
console.log("✅ Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/admin", require("./routes/admin.routes"));

app.use('/api/bookings', bookingRoutes);

// ✅ Basic route
app.get("/", (req, res) => res.send("WalkApp Backend API running"));

// HTTP + Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const setupSocket = require("./socket");
setupSocket(server);

// ✅ Real-time socket setup
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};
startServer();

// ✅ Routes (will be added in Stage 2)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/reviews", require("./routes/reviews.routes"));
const bookingsRouter = require("./routes/bookings.routes")(io);
app.use("/api/bookings", bookingsRouter);
require("./swagger")(app);

module.exports = { app, startServer };
