"use client"

import { useState } from "react"
import Sidebar from "../../components/dashboard/Sidebar"
import Navbar from "../../components/dashboard/Navbar"

const AdminDashboard = () => {

  return (

    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        🚀 We Are Coming Soon
      </h1>
      <p className="text-lg text-gray-600">
        Building the next generation <span className="font-semibold text-blue-600">Fintech Software</span> for <span className="font-semibold text-green-600">LegaTech</span>.
        <br />Please stay tuned!
      </p>
    </div>

  )
}

export default AdminDashboard
