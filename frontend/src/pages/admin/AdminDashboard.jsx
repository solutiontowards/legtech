"use client";

import React, { useState, useEffect } from "react";
import {
  getServiceCount,
  getPendingRetailerCount,
  getRetailerCount,
} from "../../api/admin";
import { Server, UserCheck, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Smooth animated counter
const AnimatedCounter = ({ endValue, className }) => {
  const [count, setCount] = useState(0);
  const duration = 1500;

  useEffect(() => {
    let start = 0;
    const end = parseInt(endValue, 10);
    if (start === end) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * (end - start) + start);
      setCount(currentCount);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [endValue]);

  return (
    <span className={`${className} tracking-wide`}>
      {count.toLocaleString()}
    </span>
  );
};

// Redesigned Stat Card
const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div
    className={`
      group relative overflow-hidden bg-white p-8 rounded-3xl shadow-md
      flex items-center justify-between transition-all duration-500
      hover:shadow-2xl hover:-translate-y-2 cursor-pointer
    `}
  >
    {/* Subtle gradient overlay */}
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${color} transition-opacity duration-500`}
    ></div>

    <div className="relative z-10">
      {loading ? (
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      ) : (
        <AnimatedCounter
          endValue={value}
          className="text-5xl font-extrabold text-gray-900 group-hover:text-white transition-colors duration-500"
        />
      )}
      <p className="text-base font-medium text-gray-500 group-hover:text-gray-100 transition-colors duration-500 mt-2">
        {title}
      </p>
    </div>

    <div
      className={`
        relative z-10 p-5 rounded-2xl bg-gray-100
        group-hover:bg-white/20 transition-all duration-500
        transform group-hover:scale-110 group-hover:rotate-6
      `}
    >
      <Icon className="h-10 w-10 text-gray-800 group-hover:text-white transition-colors duration-500" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    pendingRetailers: 0,
    totalRetailers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [serviceRes, pendingRes, totalRes] = await Promise.all([
          getServiceCount(),
          getPendingRetailerCount(),
          getRetailerCount(),
        ]);

        setStats({
          services: serviceRes.data.count,
          pendingRetailers: pendingRes.data.count,
          totalRetailers: totalRes.data.count,
        });
      } catch (error) {
        toast.error("Failed to fetch dashboard stats.");
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCardsData = [
    {
      title: "Total Services",
      value: stats.services,
      icon: Server,
      color: "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600",
    },
    {
      title: "Pending Retailers",
      value: stats.pendingRetailers,
      icon: UserCheck,
      color: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
    },
    {
      title: "Total Retailers",
      value: stats.totalRetailers,
      icon: Users,
      color: "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-gradient-to-br bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCardsData.map((card, index) => (
          <StatCard key={index} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
