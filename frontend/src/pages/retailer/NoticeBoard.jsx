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

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await getActiveNotices();
        setNotices(data?.notices?.length ? data.notices : []);
      } catch {
        toast.error("Failed to load announcements");
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const track = scrollTrackRef.current;
    if (container && track) setIsOverflowing(track.scrollHeight > container.clientHeight);
  }, [notices]);

  const shouldDuplicate = isOverflowing && notices.length > 1;

  return (
    <div className="w-full">
      <style>{`
        @keyframes scroll-loop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll { animation: scroll-loop 24s linear infinite; }
        .pause:hover .animate-scroll { animation-play-state: paused; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Announcements</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Stay updated with the latest news</p>
        </div>
      </div>

      {/* Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="relative h-[360px] sm:h-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md pause"
      >
        <div ref={scrollTrackRef} className={`transition-all ${isOverflowing ? "animate-scroll" : ""}`}>
          {notices.length > 0 ? (
            <>
              {notices.map((n, i) => (
                <div
                  key={n._id || i}
                  className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-slate-100 hover:bg-blue-50 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">{n.text}</p>
                </div>
              ))}
              {shouldDuplicate &&
                notices.map((n, i) => (
                  <div
                    key={`dup-${n._id || i}`}
                    className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-slate-100 hover:bg-blue-50 transition-all"
                    aria-hidden="true"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">{n.text}</p>
                  </div>
                ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
              No announcements available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
