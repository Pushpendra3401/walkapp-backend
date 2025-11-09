const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const socketIo = require("socket.io");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const bookingsRoutesFactory = require("./routes/bookings.routes");
const usersRoutes = require("./routes/users.routes");
const walletRoutes = require("./routes/wallet.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const searchRoutes = require("./routes/search.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Basic health
app.get("/", (req, res) => res.send("WalkApp Backend API running"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/search", searchRoutes);
app.use("/admin", adminRoutes);

// HTTP + Socket.io
const server = http.createServer(app);
const io = new socketIo.Server(server, { cors: { origin: "*" } });
app.set("io", io);
require("./socket")(io);

// Mount bookings route factory
const bookingsRoutes = bookingsRoutesFactory(io);
app.use("/api/bookings", bookingsRoutes);

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer().catch((err) => {
  console.error("❌ Server start failed:", err);
  process.exit(1);
});
