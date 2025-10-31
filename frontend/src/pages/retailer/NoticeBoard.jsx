"use client"

import { useState, useEffect } from "react"
import { Megaphone, AlertCircle, TrendingUp, Lock } from "lucide-react"

const notices = [
  {
    id: 1,
    text: "System maintenance scheduled for Sunday at 2 AM. Expect brief downtime.",
    icon: AlertCircle,
    type: "maintenance",
  },
  {
    id: 2,
    text: "New PAN card services are now live! Check them out in the services section.",
    icon: TrendingUp,
    type: "feature",
  },
  {
    id: 3,
    text: "Please update your KYC details by month-end to avoid service interruption.",
    icon: Lock,
    type: "alert",
  },
  {
    id: 4,
    text: "Special offer: Get 20% bonus on wallet top-ups above ₹5000 this week.",
    icon: TrendingUp,
    type: "promotion",
  },
  {
    id: 5,
    text: "Terms of service updated. Please review them at your earliest convenience.",
    icon: AlertCircle,
    type: "update",
  },
  {
    id: 6,
    text: "Customer support unavailable on national holidays.",
    icon: AlertCircle,
    type: "info",
  },
]

const NoticeBoard = () => {
  const [displayNotices, setDisplayNotices] = useState([])

  useEffect(() => {
    // Double the notices for seamless looping
    setDisplayNotices([...notices, ...notices])
  }, [])

  const getIconColor = (type) => {
    const colors = {
      maintenance: "text-orange-500",
      feature: "text-green-500",
      alert: "text-red-500",
      promotion: "text-blue-500",
      update: "text-purple-500",
      info: "text-slate-500",
    }
    return colors[type] || "text-slate-500"
  }

  const getBackgroundColor = (type) => {
    const colors = {
      maintenance: "bg-orange-50",
      feature: "bg-green-50",
      alert: "bg-red-50",
      promotion: "bg-blue-50",
      update: "bg-purple-50",
      info: "bg-slate-50",
    }
    return colors[type] || "bg-slate-50"
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <style>{`
        @keyframes scroll-top-to-bottom {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .notice-scroll-container {
          overflow: hidden;
          border-radius: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .notice-scroll-track {
          animation: scroll-top-to-bottom 24s linear infinite;
          padding-top: 12px;
        }

        .notice-scroll-container:hover .notice-scroll-track {
          animation-play-state: paused;
        }

        .notice-item {
          padding: 20px 28px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          gap: 18px;
          align-items: flex-start;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .notice-item:hover {
          background-color: rgba(59, 130, 246, 0.08);
          transform: translateX(6px);
          padding-left: 34px;
        }

        .notice-item:last-of-type {
          border-bottom: none;
        }

        .notice-icon-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: rgba(59, 130, 246, 0.12);
          transition: all 0.3s ease;
        }

        .notice-item:hover .notice-icon-wrapper {
          background-color: rgba(59, 130, 246, 0.18);
          transform: scale(1.08);
        }

        .notice-content {
          flex: 1;
          padding-top: 2px;
        }

        .notice-text {
          font-size: 15px;
          line-height: 1.7;
          color: #2d3748;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .notice-item:hover .notice-text {
          color: #1a202c;
        }
      `}</style>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-lg">
            <Megaphone className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Announcements</h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">Stay updated with the latest news and updates</p>
          </div>
        </div>
      </div>

      {/* Scrolling Container - CHANGE: Increased height from 280px to 520px for more prominent display */}
      <div className="notice-scroll-container" style={{ height: "520px" }}>
        <div className="notice-scroll-track">
          {displayNotices.map((notice, index) => {
            const IconComponent = notice.icon
            return (
              <div key={`${notice.id}-${index}`} className="notice-item">
                <div className="notice-icon-wrapper">
                  <IconComponent className={`w-6 h-6 ${getIconColor(notice.type)}`} strokeWidth={1.5} />
                </div>
                <div className="notice-content">
                  <p className="notice-text">{notice.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>


    </div>
  )
}

export default NoticeBoard
