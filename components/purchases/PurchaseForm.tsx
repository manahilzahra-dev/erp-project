"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Supplier {
  _id: string;
  name: string;
  company: string;
}

interface Product {
  _id: string;
  name: string;
  costPrice: number;
  stockQuantity: number;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface PurchaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseForm({ onClose, onSuccess }: PurchaseFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supData, prodData] = await Promise.all([
          api.get<{ suppliers: Supplier[] }>("/api/suppliers"),
          api.get<{ products: Product[] }>("/api/products"),
        ]);
        setSuppliers(supData.suppliers || []);
        setProducts(prodData.products || []);
        if (supData.suppliers && supData.suppliers.length > 0) {
          setSupplierId(supData.suppliers[0]._id);
        }
      } catch {
        console.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    const existingItemIndex = items.findIndex((i) => i.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * product.costPrice;
      setItems(newItems);
    } else {
      const newItem: PurchaseItem = {
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        unitCost: product.costPrice,
        total: product.costPrice * quantity,
      };
      setItems([...items, newItem]);
    }

    setQuantity(1);
    setSelectedProductId("");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (items.length === 0) {
      setError("Please add at least one item to the purchase order.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/purchases", {
        supplierId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">Create Purchase Order</h2>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="purchaseForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Select Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="" disabled>Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.company})</option>
                ))}
              </select>
            </div>

            {/* Add Items Section */}
            <div className="p-4 bg-(--surface-subtle) border border-(--border) rounded-lg">
              <h3 className="text-[13px] font-semibold text-(--text-primary) mb-3">Add Items to Order</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] text-(--text-muted) mb-1">Product</label>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[13px] focus:outline-none bg-white">
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - Cost: Rs {p.costPrice}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-[11px] text-(--text-muted) mb-1">Qty</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[13px] focus:outline-none" />
                </div>
                <button type="button" onClick={handleAddItem} disabled={!selectedProductId}
                  className="px-4 py-2 bg-(--text-primary) text-white text-[13px] font-medium rounded-md hover:bg-slate-800 disabled:opacity-50">
                  Add
                </button>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="border border-(--border) rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-(--surface-subtle)">
                    <tr>
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Item</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Qty</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Cost</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {items.map((item, index) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-[13px] text-(--text-primary)">{item.productName}</td>
                        <td className="px-4 py-3 text-[13px]">{item.quantity}</td>
                        <td className="px-4 py-3 text-[13px]">Rs {item.unitCost}</td>
                        <td className="px-4 py-3 text-[13px] font-medium">Rs {item.total}</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-[13px]">
                  <div className="flex justify-between font-bold text-[15px] text-(--text-primary) pt-2 border-t border-(--border)">
                    <span>Total Cost:</span>
                    <span>Rs {totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="purchaseForm" disabled={loading || items.length === 0} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create Purchase Order"}
          </button>
        </div>

      </div>
    </div>
  );
}