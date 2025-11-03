import asyncHandler from "express-async-handler";
import Wallet from "../models/Wallet.js";
import Service from "../models/Service.js";
import Submission from "../models/Submission.js";
import mongoose from "mongoose";

export const getDashboardData = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;

  // 1. Get Wallet Balance
  const wallet = await Wallet.findOne({ retailerId });
  const walletBalance = wallet ? wallet.balance : 0;

  // 2. Get total available services count
  const servicesCount = await Service.countDocuments({ isActive: true });

  // 3. Get monthly applications count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const monthlyApplicationsCount = await Submission.countDocuments({
    retailerId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  });

  // 4. Get chart data (service usage this month)
  const monthlySubmissions = await Submission.find({
    retailerId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).populate({
    path: "optionId",
    select: "name",
    populate: { path: "subServiceId", select: "name", populate: { path: "serviceId", select: "name" } },
  });

  const serviceUsage = monthlySubmissions.reduce((acc, submission) => {
    const serviceName = submission.optionId?.subServiceId?.serviceId?.name || "Unknown";
    acc[serviceName] = (acc[serviceName] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(serviceUsage).map(([name, applications]) => ({ name, applications }));

  res.json({
    ok: true,
    data: { walletBalance, servicesCount, monthlyApplicationsCount, chartData },
  });
});