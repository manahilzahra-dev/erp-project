"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import InvoiceForm from "@/components/invoices/InvoiceForm";

interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceRecord {
  _id: string;
  invoiceNumber: string;
  date: string;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: string;
  customerId: {
    name: string;
    company?: string;
    email: string;
  };
  items: InvoiceItem[];
}

export default function SalesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ invoices: InvoiceRecord[] }>("/api/invoices");
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchInvoices();
    };
    load();
  }, [fetchInvoices]);

  const handleMarkAsPaid = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/api/invoices/${id}`, { status: "paid" });
      fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/invoices/${deleteId}`);
      setDeleteId(null);
      fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (user && !["admin", "sales", "finance", "management"].includes(user.role)) {
    return (
      <div className="p-8 text-center text-(--text-muted)">
        You do not have permission to view this page.
      </div>
    );
  }

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Sales & Invoices</h1>
          <p className="text-[14px] text-(--text-secondary) mt-1">Manage sales and generate customer invoices</p>
        </div>
        
        {user && ["admin", "sales"].includes(user.role) && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[14px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Invoice
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="erp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border) bg-(--surface-subtle)">
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-(--text-muted)">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
                      Loading invoices...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No invoices found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Click &quot;Create Invoice&quot; to generate one.</p>
                  </td>
                </tr>
              )}

              {!loading && invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-(--surface-subtle) transition-colors group">
                  <td className="px-6 py-4 text-[13px] font-mono text-(--text-primary)">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-(--text-primary)">{inv.customerId?.name}</p>
                    <p className="text-[12px] text-(--text-muted)">{inv.customerId?.company || "Individual"}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-(--text-primary)">{formatPKR(inv.grandTotal)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                      inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      inv.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* View Button */}
                      <button onClick={() => setViewInvoice(inv)} className="p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-subtle) rounded transition-colors" title="View Invoice">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* Mark as Paid */}
                      {inv.status === "unpaid" && user && ["admin", "sales", "finance"].includes(user.role) && (
                        <button onClick={() => handleMarkAsPaid(inv._id)} disabled={updatingId === inv._id} className="p-1.5 text-(--text-muted) hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50" title="Mark as Paid">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      {/* Delete */}
                      {user?.role === "admin" && (
                        <button onClick={() => setDeleteId(inv._id)} className="p-1.5 text-(--text-muted) hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <InvoiceForm onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); fetchInvoices(); }} />
      )}

      {/* View Invoice Modal (Proper Bill) */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface) w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between bg-(--surface-subtle) rounded-t-xl">
              <div>
                <h2 className="text-[18px] font-semibold text-(--text-primary)">Invoice</h2>
                <p className="text-[12px] font-mono text-(--text-muted)">{viewInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-[24px] font-bold text-(--brand-600) mb-1">ERP System</h1>
                  <p className="text-[12px] text-(--text-muted)">123 Business Ave, Karachi<br/>contact@erpsystem.com</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Billed To</p>
                  <p className="text-[14px] font-semibold text-(--text-primary)">{viewInvoice.customerId?.name}</p>
                  <p className="text-[12px] text-(--text-secondary)">{viewInvoice.customerId?.company}</p>
                  <p className="text-[12px] text-(--text-secondary)">{viewInvoice.customerId?.email}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b border-(--border)">
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase">Item</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-center">Qty</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-right">Price</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {viewInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-[13px] text-(--text-primary)">{item.productName}</td>
                      <td className="py-3 text-[13px] text-(--text-secondary) text-center">{item.quantity}</td>
                      <td className="py-3 text-[13px] text-(--text-secondary) text-right">{formatPKR(item.unitPrice)}</td>
                      <td className="py-3 text-[13px] font-medium text-(--text-primary) text-right">{formatPKR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-(--text-secondary)">Subtotal</span>
                    <span className="text-(--text-primary)">{formatPKR(viewInvoice.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-(--text-secondary)">Tax ({viewInvoice.taxRate}%)</span>
                    <span className="text-(--text-primary)">{formatPKR(viewInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-bold text-(--brand-600) pt-3 border-t border-(--border)">
                    <span>Total</span>
                    <span>{formatPKR(viewInvoice.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Status Stamp */}
              <div className="mt-8 text-center">
                <span className={`inline-block px-4 py-1 rounded-md text-[14px] font-bold uppercase tracking-widest border-2 ${
                  viewInvoice.status === "paid" ? "text-emerald-600 border-emerald-600/30 bg-emerald-50" :
                  viewInvoice.status === "cancelled" ? "text-red-600 border-red-600/30 bg-red-50" :
                  "text-amber-600 border-amber-600/30 bg-amber-50"
                }`}>
                  {viewInvoice.status}
                </span>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-(--border) bg-(--surface-subtle) rounded-b-xl flex justify-end">
              <button onClick={() => setViewInvoice(null)} className="px-4 py-2 bg-(--surface) border border-(--border) text-[13px] font-medium text-(--text-primary) rounded-md hover:bg-(--surface-subtle) transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface) w-full max-w-sm rounded-xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.993l-6.928-12c-.77-1.326-2.694-1.326-3.464 0l-6.928 12c-.77 1.326.192 2.993 1.732 2.993z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-(--text-primary) mb-2">Delete Invoice?</h3>
            <p className="text-[13px] text-(--text-secondary) mb-6">
              This will permanently delete the invoice AND restore all items back to inventory stock.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}