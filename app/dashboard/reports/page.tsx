"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";

interface Summary {
  totalEmployees: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
}

interface RecentSale {
  _id: string;
  invoiceNumber: string;
  grandTotal: number;
  customerId: { name: string };
  createdAt: string;
}

interface ReportsData {
  summary: Summary;
  lowStockProducts: LowStockProduct[];
  recentSales: RecentSale[];
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<{ success: boolean; data: ReportsData }>("/api/reports");
      
      // API se data.data aata hai
      if (response && response.data) {
        setData(response.data);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchReports();
    };
    load();
  }, [fetchReports]);

  if (user && !["admin", "management"].includes(user.role)) {
    return (
      <div className="p-8 text-center text-(--text-muted)">
        You do not have permission to view this page.
      </div>
    );
  }

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const iconProps = {
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    className: "w-5 h-5",
  };

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Reports & Analytics</h1>
        <p className="text-[14px] text-(--text-secondary) mt-1">Overview of your business performance</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Employees"
              value={data.summary.totalEmployees.toString()}
              icon={<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            />
            <StatCard
              title="Inventory Items"
              value={data.summary.totalProducts.toString()}
              icon={<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
            />
            <StatCard
              title="Total Invoices"
              value={data.summary.totalSales.toString()}
              icon={<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
            />
            <StatCard
              title="Net Profit"
              value={formatPKR(data.summary.netProfit)}
              icon={<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
            />
          </div>

          {/* Financial Summary & Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 erp-card p-6">
              <h2 className="text-[16px] font-semibold text-(--text-primary) mb-4">Financial Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-(--text-secondary)">Revenue (Sales + Income)</span>
                    <span className="font-semibold text-emerald-600">{formatPKR(data.summary.totalRevenue)}</span>
                  </div>
                  <div className="w-full bg-(--surface-subtle) rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-(--text-secondary)">Total Expenses</span>
                    <span className="font-semibold text-red-600">{formatPKR(data.summary.totalExpense)}</span>
                  </div>
                  <div className="w-full bg-(--surface-subtle) rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${data.summary.totalRevenue > 0 ? Math.min(100, (data.summary.totalExpense / data.summary.totalRevenue) * 100) : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="erp-card p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.993l-6.928-12c-.77-1.326-2.694-1.326-3.464 0l-6.928 12c-.77 1.326.192 2.993 1.732 2.993z" />
                </svg>
                <h2 className="text-[16px] font-semibold text-(--text-primary)">Low Stock Alerts</h2>
              </div>
              {data.lowStockProducts.length === 0 ? (
                <p className="text-[13px] text-(--text-muted)">All products are well-stocked.</p>
              ) : (
                <ul className="space-y-2">
                  {data.lowStockProducts.slice(0, 3).map((p) => (
                    <li key={p._id} className="flex justify-between text-[13px]">
                      <span className="text-(--text-secondary)">{p.name}</span>
                      <span className="text-red-600 font-medium">{p.stockQuantity} left</span>
                    </li>
                  ))}
                  {data.lowStockProducts.length > 3 && (
                    <li className="text-[12px] text-(--text-muted) text-right mt-2">
                      +{data.lowStockProducts.length - 3} more...
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="erp-card overflow-hidden">
            <div className="px-6 py-4 border-b border-(--border) bg-(--surface-subtle)">
              <h2 className="text-[14px] font-semibold text-(--text-primary)">Recent Paid Invoices</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--border)">
                  <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase">Customer</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {data.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-(--text-muted) text-[13px]">
                      No paid invoices yet.
                    </td>
                  </tr>
                ) : (
                  data.recentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-(--surface-subtle) transition-colors">
                      <td className="px-6 py-3 text-[13px] font-mono text-(--text-primary)">{sale.invoiceNumber}</td>
                      <td className="px-6 py-3 text-[13px] text-(--text-secondary)">{sale.customerId?.name}</td>
                      <td className="px-6 py-3 text-[13px] text-(--text-secondary)">{formatDate(sale.createdAt)}</td>
                      <td className="px-6 py-3 text-[13px] font-medium text-(--text-primary) text-right">{formatPKR(sale.grandTotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-(--text-muted)">
          No data available.
        </div>
      )}
    </div>
  );
}