"use client";

import React, { useState, useEffect, useRef } from "react";
import { Megaphone, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getActiveNotices } from "../../api/notice";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const scrollContainerRef = useRef(null);
  const scrollTrackRef = useRef(null);

  // Fetch notices from API
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await getActiveNotices();
        if (data?.ok && Array.isArray(data.notices) && data.notices.length > 0) {
          setNotices(data.notices);
        } else {
          setNotices([]);
        }
      } catch (err) {
        console.error("Error fetching notices:", err);
        toast.error("Failed to load announcements");
      }
    };

    fetchNotices();
  }, []);

  // Detect overflow for scroll animation
  useEffect(() => {
    const container = scrollContainerRef.current;
    const track = scrollTrackRef.current;
    if (container && track) {
      setIsOverflowing(track.scrollHeight > container.clientHeight);
    }
  }, [notices]);

  // Only duplicate if more than one notice and scrolling is active
  const shouldDuplicate = isOverflowing && notices.length > 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Animation styles */}
      <style>{`
        @keyframes scroll-loop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll {
          animation: scroll-loop 24s linear infinite;
        }
        .pause:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
          <Megaphone className="w-7 h-7 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Announcements</h2>
          <p className="text-sm text-slate-600 font-medium">
            Stay updated with the latest news and updates
          </p>
        </div>
      </div>

      {/* Notice Container */}
      <div
        ref={scrollContainerRef}
        className="relative h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-xl pause"
      >
        <div
          ref={scrollTrackRef}
          className={`pt-3 transition-all ${isOverflowing ? "animate-scroll" : ""}`}
        >
          {notices.length > 0 ? (
            <>
              {notices.map((notice, i) => (
                <div
                  key={notice._id || i}
                  className="flex items-start gap-4 px-7 py-5 border-b border-slate-100 hover:bg-blue-50/60 transition-all duration-300 hover:translate-x-1"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-700 font-medium tracking-wide">
                    {notice.text}
                  </p>
                </div>
              ))}
              {shouldDuplicate &&
                notices.map((notice, i) => (
                  <div
                    key={`dup-${notice._id || i}`}
                    className="flex items-start gap-4 px-7 py-5 border-b border-slate-100 hover:bg-blue-50/60 transition-all duration-300"
                    aria-hidden="true"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-700 font-medium tracking-wide">
                      {notice.text}
                    </p>
                  </div>
                ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-[520px] text-slate-500 font-medium">
              No announcements available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
