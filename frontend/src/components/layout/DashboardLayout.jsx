
import { useState } from "react"

import { Outlet } from "react-router-dom"
import Sidebar from "../dashboard/Sidebar"
import Navbar from "../dashboard/Navbar"

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 ">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
