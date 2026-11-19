"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface FinanceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FinanceForm({ onClose, onSuccess }: FinanceFormProps) {
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Expense fields
  const [expenseData, setExpenseData] = useState({
    title: "",
    category: "other",
    amount: "",
    notes: "",
  });

  // Income fields
  const [incomeData, setIncomeData] = useState({
    amount: "",
    description: "",
    reference: "",
  });

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeData({ ...incomeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formType === "expense") {
        await api.post("/api/finance", {
          type: "expense",
          ...expenseData,
          amount: Number(expenseData.amount),
        });
      } else {
        await api.post("/api/finance", {
          type: "income",
          ...incomeData,
          amount: Number(incomeData.amount),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">Add Transaction</h2>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            onClick={() => setFormType("expense")}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
              formType === "expense" ? "bg-red-50 text-red-700 border border-red-200" : "text-(--text-secondary) hover:bg-(--surface-subtle)"
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setFormType("income")}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
              formType === "income" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-(--text-secondary) hover:bg-(--surface-subtle)"
            }`}
          >
            Add Income
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="financeForm" onSubmit={handleSubmit} className="space-y-4">
            
            {formType === "expense" ? (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Expense Title *</label>
                  <input type="text" name="title" required value={expenseData.title} onChange={handleExpenseChange} placeholder="e.g. Office Rent"
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Category *</label>
                  <select name="category" required value={expenseData.category} onChange={handleExpenseChange}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities (Bijli/Paani)</option>
                    <option value="salary">Salary</option>
                    <option value="supplies">Office Supplies</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Amount (PKR) *</label>
                  <input type="number" name="amount" required min="1" value={expenseData.amount} onChange={handleExpenseChange} placeholder="e.g. 50000"
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Notes (Optional)</label>
                  <textarea name="notes" value={expenseData.notes} onChange={handleExpenseChange} rows={2}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) resize-none"
                    placeholder="Any extra details..." />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Description *</label>
                  <input type="text" name="description" required value={incomeData.description} onChange={handleIncomeChange} placeholder="e.g. Advance Payment"
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Reference (Optional)</label>
                  <input type="text" name="reference" value={incomeData.reference} onChange={handleIncomeChange} placeholder="e.g. INV-12345"
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Amount (PKR) *</label>
                  <input type="number" name="amount" required min="1" value={incomeData.amount} onChange={handleIncomeChange} placeholder="e.g. 100000"
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
                </div>
              </>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="financeForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (formType === "expense" ? "Save Expense" : "Save Income")}
          </button>
        </div>

      </div>
    </div>
  );
}