import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import "dotenv/config";
import connectDB from "./config/db.js";
const app = express();


import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import serviceRoutes from './routes/services.js';
import submissionRoutes from './routes/submissions.js';
import walletRoutes from './routes/wallet.js';
import uploadRoutes from './routes/upload.js';


app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/upload', uploadRoutes);


app.use(
  cors({
    origin: process.env.CLIENT_URL || " http://localhost:5173",
    credentials: true,
  })
);
connectDB();

app.get("/health", (req, res) => res.json({ ok: true, time: new Date() }));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is running on port http://localhost:4000");
});
