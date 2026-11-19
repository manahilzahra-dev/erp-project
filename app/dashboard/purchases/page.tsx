"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import PurchaseForm from "@/components/purchases/PurchaseForm";

interface PurchaseItem {
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface PurchaseRecord {
  _id: string;
  purchaseOrderNumber: string;
  totalAmount: number;
  status: string;
  date: string;
  supplierId: {
    name: string;
    company: string;
  };
  items: PurchaseItem[];
}

export default function PurchasesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<PurchaseRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ purchases: PurchaseRecord[] }>("/api/purchases");
      setPurchases(data.purchases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchPurchases();
    };
    load();
  }, [fetchPurchases]);

  const handleReceive = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/api/purchases/${id}`, { status: "received" });
      fetchPurchases();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to receive order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (user && !["admin", "inventory", "management"].includes(user.role)) {
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
          <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Purchasing</h1>
          <p className="text-[14px] text-(--text-secondary) mt-1">Manage purchase orders from suppliers</p>
        </div>
        
        {user && ["admin", "inventory"].includes(user.role) && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[14px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Purchase Order
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
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Total Amount</th>
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
                      Loading purchase orders...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No purchase orders found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Click &quot;New Purchase Order&quot; to create one.</p>
                  </td>
                </tr>
              )}

              {!loading && purchases.map((po) => (
                <tr key={po._id} className="hover:bg-(--surface-subtle) transition-colors group">
                  <td className="px-6 py-4 text-[13px] font-mono text-(--text-primary)">{po.purchaseOrderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-(--text-primary)">{po.supplierId?.name}</p>
                    <p className="text-[12px] text-(--text-muted)">{po.supplierId?.company}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{formatDate(po.date)}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-(--text-primary)">{formatPKR(po.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                      po.status === "received" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      po.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* View Button */}
                      <button onClick={() => setViewPurchase(po)} className="p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-subtle) rounded transition-colors" title="View Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* Receive Button */}
                      {po.status === "pending" && user && ["admin", "inventory"].includes(user.role) && (
                        <button onClick={() => handleReceive(po._id)} disabled={updatingId === po._id} className="p-1.5 text-(--text-muted) hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50" title="Mark as Received">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
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
        <PurchaseForm onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); fetchPurchases(); }} />
      )}

      {/* View Details Modal */}
      {viewPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface) w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between bg-(--surface-subtle) rounded-t-xl">
              <div>
                <h2 className="text-[18px] font-semibold text-(--text-primary)">Purchase Order</h2>
                <p className="text-[12px] font-mono text-(--text-muted)">{viewPurchase.purchaseOrderNumber}</p>
              </div>
              <button onClick={() => setViewPurchase(null)} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Supplier</p>
                  <p className="text-[14px] font-semibold text-(--text-primary)">{viewPurchase.supplierId?.name}</p>
                  <p className="text-[12px] text-(--text-secondary)">{viewPurchase.supplierId?.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Date</p>
                  <p className="text-[14px] text-(--text-primary)">{formatDate(viewPurchase.date)}</p>
                </div>
              </div>

              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b border-(--border)">
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase">Item</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-center">Qty</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-right">Cost</th>
                    <th className="pb-2 text-[11px] font-semibold text-(--text-muted) uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {viewPurchase.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-[13px] text-(--text-primary)">{item.productName}</td>
                      <td className="py-3 text-[13px] text-(--text-secondary) text-center">{item.quantity}</td>
                      <td className="py-3 text-[13px] text-(--text-secondary) text-right">{formatPKR(item.unitCost)}</td>
                      <td className="py-3 text-[13px] font-medium text-(--text-primary) text-right">{formatPKR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[16px] font-bold text-(--brand-600) pt-3 border-t border-(--border)">
                    <span>Total Amount</span>
                    <span>{formatPKR(viewPurchase.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-(--border) bg-(--surface-subtle) rounded-b-xl flex justify-end">
              <button onClick={() => setViewPurchase(null)} className="px-4 py-2 bg-(--surface) border border-(--border) text-[13px] font-medium text-(--text-primary) rounded-md hover:bg-(--surface-subtle) transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}