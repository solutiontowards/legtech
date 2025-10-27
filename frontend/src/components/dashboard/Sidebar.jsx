"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PieChart,
  Settings,
  LogOut,
  ChevronDown,
  Briefcase,
} from "lucide-react"

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const retailerLinks = [
    { id: "overview", to: "/retailer", text: "Overview", icon: LayoutDashboard },
    { id: "products", to: "/retailer/products", text: "Products", icon: Package },
    { id: "orders", to: "/retailer/orders", text: "Orders", icon: ShoppingCart },
    { id: "analytics", to: "/retailer/analytics", text: "Analytics", icon: PieChart },
  ]

  const adminLinks = [
    { id: "overview", to: "/admin/dashboard", text: "Overview", icon: LayoutDashboard },
    {
      id: "retailers",
      text: "Retailers",
      icon: Briefcase,
      submenu: [
        { to: "/admin/verify-retailers", text: "Verify Retailers" },
        { to: "/admin/retailers", text: "All Retailers" },
        { to: "/admin/register-retailer", text: "Add New" },
      ],
    },
    { id: "analytics", to: "/admin/analytics", text: "Analytics", icon: PieChart },
  ]

  const links = user?.role === "admin" ? adminLinks : retailerLinks

  const toggleMenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id)
  }

  const activeClass =
    "bg-green-200 text-green-900 font-semibold shadow-sm"

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-screen z-40 transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 md:w-20"
        } bg-green-50 border-r border-green-200 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-green-200">
          <div className="flex items-center justify-center">
            {isOpen && <img src="/logo.png" alt="Logo" className="h-16 w-auto" />}
          </div>
        </div>

        {/* User info */}
        {isOpen && (
          <div className="p-4 border-b border-green-200 bg-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-green-600 flex-shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs truncate text-green-700">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isExpanded = expandedMenu === link.id

            return (
              <div key={link.id}>
                {link.to ? (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-green-700 hover:bg-green-200 ${
                        isActive ? activeClass : ""
                      }`
                    }
                    title={!isOpen ? link.text : ""}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="ml-3 truncate">{link.text}</span>}
                  </NavLink>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(link.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-green-700 hover:bg-green-200"
                      title={!isOpen ? link.text : ""}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {isOpen && <span className="truncate">{link.text}</span>}
                      </div>
                      {isOpen && (
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {isOpen && link.submenu && isExpanded && (
                      <div className="ml-8 mt-1 space-y-1 border-l-2 border-green-300 pl-2">
                        {link.submenu.map((subitem, idx) => (
                          <NavLink
                            key={idx}
                            to={subitem.to}
                            className={({ isActive }) =>
                              `block w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors text-green-600 hover:bg-green-200 hover:text-green-900 ${
                                isActive ? "bg-green-200 text-green-900 font-semibold" : ""
                              }`
                            }
                          >
                            {subitem.text}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer buttons */}
        {isOpen ? (
          <div className="p-3 border-t border-green-200 bg-green-100 space-y-1">
            <NavLink
              to={user?.role === "admin" ? "/admin/settings" : "/retailer/settings"}
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-green-700 hover:bg-green-200 ${
                  isActive ? activeClass : ""
                }`
              }
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-green-200"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="p-2 border-t border-green-200 space-y-2 mt-auto">
            <NavLink
              to={user?.role === "admin" ? "/admin/settings" : "/retailer/settings"}
              className={({ isActive }) =>
                `w-full p-2 rounded-lg transition-colors text-green-700 hover:bg-green-200 flex justify-center ${
                  isActive ? "bg-green-200 text-green-900" : ""
                }`
              }
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </NavLink>
            <button
              onClick={logout}
              className="w-full p-2 rounded-lg transition-colors text-red-600 hover:bg-green-200 flex justify-center"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
