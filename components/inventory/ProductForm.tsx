"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    costPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    description?: string;
  } | null;
}

export default function ProductForm({ onClose, onSuccess, initialData }: ProductFormProps) {
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "Electronics",
    price: initialData?.price?.toString() || "",
    costPrice: initialData?.costPrice?.toString() || "",
    stockQuantity: initialData?.stockQuantity?.toString() || "",
    lowStockThreshold: initialData?.lowStockThreshold?.toString() || "10",
    description: initialData?.description || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
      };

      if (isEditMode) {
        await api.put(`/api/products/${initialData._id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
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
            {isEditMode ? "Edit Product" : "Add New Product"}
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

          <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Product Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Dell Laptop"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">SKU Code *</label>
              <input type="text" name="sku" required value={form.sku} onChange={handleChange} placeholder="e.g. ELEC-001"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Category *</label>
              <select name="category" required value={form.category} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
                <option value="Software">Software</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Selling Price (PKR) *</label>
              <input type="number" name="price" required min="0" value={form.price} onChange={handleChange} placeholder="e.g. 150000"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Cost Price (PKR) *</label>
              <input type="number" name="costPrice" required min="0" value={form.costPrice} onChange={handleChange} placeholder="e.g. 120000"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Initial Stock Quantity *</label>
              <input type="number" name="stockQuantity" required min="0" value={form.stockQuantity} onChange={handleChange} placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Low Stock Alert (Threshold)</label>
              <input type="number" name="lowStockThreshold" min="0" value={form.lowStockThreshold} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              <p className="text-[11px] text-(--text-muted) mt-1">Alert when stock drops below this</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Description (Optional)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) resize-none"
                placeholder="Product details..." />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="productForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (isEditMode ? "Update Product" : "Save Product")}
          </button>
        </div>

      </div>
    </div>
  );
}