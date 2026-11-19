"use client";

import { useAuth } from "@/context/AuthContext";
import RoleBadge from "@/components/ui/Badge";
import NotificationBell from "./NotificationBell"; // <-- NAYA IMPORT
import SearchBar from "./SearchBar";
export default function Navbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 bg-(--surface) border-b border-(--border) flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-(--text-muted)">Workspace</span>
        <span className="text-(--text-muted)">/</span>
        <span className="font-medium text-(--text-primary)">Dashboard</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        
     {/* Search Bar (Working) */}
        <SearchBar />

        {/* ✅ Yahan Notification Component Call Hua */}
        <NotificationBell />

        <div className="w-px h-5 bg-(--border) mx-2"></div>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-(--text-primary) flex items-center justify-center text-white text-[11px] font-semibold">
            {initials}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-(--text-primary)">
              {user?.name}
            </span>
          </div>
          {user?.role && <RoleBadge role={user.role} />}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="ml-1 w-8 h-8 rounded-[6px] hover:bg-(--surface-subtle) flex items-center justify-center text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>

      </div>
    </header>
  );
}