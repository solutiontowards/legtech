"use client"

import React, { useState, useEffect } from "react";
import { getServiceCount, getPendingRetailerCount, getRetailerCount } from "../../api/admin";
import { Server, UserCheck, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AnimatedCounter = ({ endValue }) => {
  const [count, setCount] = useState(0);
  const duration = 1500; // Animation duration in milliseconds

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
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue]);

  return <span className="text-4xl font-bold">{count.toLocaleString()}</span>;
};

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <Loader2 className="animate-spin h-8 w-8 mt-2 text-gray-400" />
      ) : (
        <AnimatedCounter endValue={value} />
      )}
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="h-7 w-7 text-white" />
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
    { title: "Total Services", value: stats.services, icon: Server, color: "bg-blue-500" },
    { title: "Pending Retailers", value: stats.pendingRetailers, icon: UserCheck, color: "bg-yellow-500" },
    { title: "Total Retailers", value: stats.totalRetailers, icon: Users, color: "bg-green-500" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCardsData.map((card, index) => (
          <StatCard key={index} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard
