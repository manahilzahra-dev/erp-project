"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import FinanceForm from "@/components/finance/FinanceForm";
import StatCard from "@/components/ui/StatCard";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  reference?: string;
  date: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ transactions: Transaction[]; summary: Summary }>("/api/finance");
      setTransactions(data.transactions || []);
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0, netProfit: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchFinance();
    };
    load();
  }, [fetchFinance]);

  if (user && !["admin", "finance", "management"].includes(user.role)) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Finance</h1>
          <p className="text-[14px] text-(--text-secondary) mt-1">Track your business income and expenses</p>
        </div>
        
        {user && ["admin", "finance"].includes(user.role) && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[14px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Transaction
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <StatCard
          title="Total Income"
          value={formatPKR(summary.totalIncome)}
          trend="+"
          trendUp={true}
          icon={
            <svg {...iconProps}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        />
        <StatCard
          title="Total Expense"
          value={formatPKR(summary.totalExpense)}
          trend="-"
          trendUp={false}
          icon={
            <svg {...iconProps}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          }
        />
        <StatCard
          title="Net Profit / Loss"
          value={formatPKR(summary.netProfit)}
          trend={summary.netProfit >= 0 ? "Profit" : "Loss"}
          trendUp={summary.netProfit >= 0}
          icon={
            <svg {...iconProps}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
      </div>

      {/* Transactions Table */}
      <div className="erp-card overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border) bg-(--surface-subtle)">
          <h2 className="text-[14px] font-semibold text-(--text-primary)">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border)">
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-(--text-muted)">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No transactions found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Click &quot;Add Transaction&quot; to get started.</p>
                  </td>
                </tr>
              )}

              {!loading && transactions.map((t) => (
                <tr key={t._id} className="hover:bg-(--surface-subtle) transition-colors">
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-(--text-primary)">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                      t.type === "income" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-[14px] font-semibold text-right ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {t.type === "income" ? "+" : "-"} {formatPKR(t.amount)}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <FinanceForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchFinance();
          }} 
        />
      )}

    </div>
  );
}