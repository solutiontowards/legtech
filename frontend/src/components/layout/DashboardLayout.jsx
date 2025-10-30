"use client"

import { useState, useEffect } from "react"
import Navbar from "../dashboard/Navbar"
import Sidebar from "../dashboard/Sidebar"
import { Outlet } from "react-router-dom"

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
