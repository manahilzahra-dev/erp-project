"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-muted)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}