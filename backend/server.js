import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "dotenv/config";
import connectDB from "./config/db.js";

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import serviceRoutes from './routes/services.js';
import submissionRoutes from './routes/submissions.js';
import walletRoutes from './routes/wallet.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/paymentRoutes.js'; // 1. Import the new payment routes
import noticesRoutes from './routes/notices.js';
import wishesRoutes from './routes/wishes.js';
import kycRoutes from './routes/kycRoutes.js';
import retailerRoutes from './routes/retailer.js';

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,       // from .env file (optional)
      "https://legtech.in",          // production live site
      "https://legtech.netlify.app"
    ].filter(Boolean),               // removes undefined entries
    credentials: true,
  })
);


// It is CRITICAL that these middleware are present and before your routes
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

connectDB();

// 2. Use the new payment callback route
// This tells Express to use your new paymentRoutes for any URL starting with /api/payment
app.use('/api/payment', paymentRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/wishes', wishesRoutes)
app.use('/api/kyc', kycRoutes);
app.use('/api/retailer', retailerRoutes);

app.get("/health", (req, res) => res.json({ ok: true, time: new Date() }));
app.get("/", (req, res) => res.send("Server is running"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(" Server running on http://localhost:4000");
});
