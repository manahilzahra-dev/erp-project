"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Stats {
  totalEmployees: number;
  totalProducts: number;
  totalSales: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<{ stats: Stats }>("/api/dashboard");
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchStats();
    };
    load();
  }, [fetchStats]);

  const iconProps = {
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    className: "w-5 h-5",
  };

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount);
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees.toString() || "0",
      icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      title: "Inventory Items",
      value: stats?.totalProducts.toString() || "0",
      icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    },
    {
      title: "Total Sales",
      value: stats ? formatPKR(stats.totalSales) : "Rs 0",
      icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
    },
    {
      title: "Pending Tasks",
      value: stats?.pendingTasks.toString() || "0",
      icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    },
  ];

  return (
    <div className="space-y-8 max-w-350 mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Dashboard</h1>
        <p className="text-[14px] text-(--text-secondary) mt-1">Overview of your business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 text-center text-(--text-muted) py-4">Loading stats...</div>
        ) : (
          statCards.map((stat) => <StatCard key={stat.title} {...stat} />)
        )}
      </div>

      {/* Welcome Hero Section */}
      <div className="erp-card p-8 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--brand-600)"></div>
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-(--surface-subtle) to-transparent opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-(--brand-50) border border-(--brand-100) flex items-center justify-center text-(--brand-700)">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-(--text-primary) tracking-tight">
                  Good to see you, {user?.name?.split(" ")[0]}
                </h2>
                <p className="text-[13px] text-(--text-muted) mt-0.5">
                  Here is what&apos;s happening with your business today.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 ml-1">
              <span className="text-[13px] text-(--text-secondary)">Logged in as</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase tracking-wide bg-(--surface-subtle) text-(--text-primary) border border-(--border)">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="hidden md:block">
             <Link href="/dashboard/reports" className="px-4 py-2 bg-(--surface) border border-(--border) rounded-md text-[13px] font-medium text-(--text-primary) hover:bg-(--surface-subtle) transition-colors shadow-sm">
               View Reports
             </Link>
          </div>
        </div>
      </div>

    </div>
  );
}