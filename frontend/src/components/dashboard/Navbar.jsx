"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Menu, X, Bell, LogOut, ChevronDown, Wallet, Phone, PhoneCall } from "lucide-react"

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const walletBalance = "₹500.00"
  const phoneNumber = "8250883776"

  return (
    <header className="sticky top-0 z-40 border-b bg-green-50 border-r border-green-200 ">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left section - Menu toggle and logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md transition-colors text-gray-600 hover:bg-yellow-100"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>


        </div>

        {/* Right section - Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Phone number - hidden on mobile */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-green-600">
            <PhoneCall className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">{phoneNumber}</span>
          </div>

          {/* Wallet balance */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-green-600">
            <Wallet className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">{walletBalance}</span>
          </div>



          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full transition-colors hover:bg-yellow-100"
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-white bg-green-600">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-600">{user?.role || "User"}</p>
              </div>
              <ChevronDown className="h-4 w-4 hidden sm:block text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 border bg-white border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-600">{user?.role || "User"}</p>
                </div>
                <a href="#" className="block px-4 py-2 text-sm transition-colors text-gray-700 hover:bg-yellow-50">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm transition-colors text-gray-700 hover:bg-yellow-50">
                  Settings
                </a>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm flex items-center transition-colors text-red-600 hover:bg-yellow-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>



        </div>
      </div>
    </header>
  )
}

export default Navbar
