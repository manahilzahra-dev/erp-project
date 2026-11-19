"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface SupplierFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    status: string;
  } | null;
}

export default function SupplierForm({ onClose, onSuccess, initialData }: SupplierFormProps) {
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    company: initialData?.company || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    status: initialData?.status || "active",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/suppliers/${initialData._id}`, form);
      } else {
        await api.post("/api/suppliers", form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">
            {isEditMode ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="supplierForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Supplier Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Ahmed Ali"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Company Name *</label>
              <input type="text" name="company" required value={form.company} onChange={handleChange} placeholder="e.g. Tech Supplies Pvt Ltd"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Email *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="supplier@company.com"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Phone *</label>
              <input type="text" name="phone" required value={form.phone} onChange={handleChange} placeholder="+92 300 1234567"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Address *</label>
              <input type="text" name="address" required value={form.address} onChange={handleChange} placeholder="Office / Warehouse Address"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Status *</label>
              <select name="status" required value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="supplierForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (isEditMode ? "Update Supplier" : "Save Supplier")}
          </button>
        </div>

      </div>
    </div>
  );
}