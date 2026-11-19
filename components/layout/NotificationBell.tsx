"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Notifications fetch karne ka function
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: Notification[]; unreadCount: number }>("/api/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      console.error("Failed to load notifications");
    }
  }, []);

  // 2. Auto-Refresh Logic (Har 30 second baad khud call hoga)
   useEffect(() => {
    // Fix: Async function mein wrap karo
    const load = async () => {
      await fetchNotifications();
    };
    load();

    // Phir har 30 second baad
    const interval = setInterval(() => {
      load();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // 3. Dropdown ke bahar click karne se close ho jaye
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Bell click handler
  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    
    // Agar unread hain, toh read mark karo
    if (!showDropdown && unreadCount > 0) {
      try {
        await api.put("/api/notifications", {});
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {
        console.error("Failed to mark as read");
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={handleBellClick}
        className="relative w-8 h-8 rounded-[6px] hover:bg-(--surface-subtle) flex items-center justify-center text-(--text-secondary) transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {/* Unread Dot */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-(--surface)"></span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-(--surface) border border-(--border) rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-(--border) bg-(--surface-subtle)">
            <h3 className="text-[13px] font-semibold text-(--text-primary)">Notifications</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-(--text-muted)">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`px-4 py-3 border-b border-(--border) last:border-b-0 hover:bg-(--surface-subtle) transition-colors ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      notif.type === "success" ? "bg-emerald-500" :
                      notif.type === "warning" ? "bg-amber-500" :
                      notif.type === "error" ? "bg-red-500" :
                      "bg-blue-500"
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-(--text-primary)">{notif.title}</p>
                      <p className="text-[12px] text-(--text-secondary) mt-0.5">{notif.message}</p>
                      <p className="text-[11px] text-(--text-muted) mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}