"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  company?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stockQuantity: number;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvoiceForm({ onClose, onSuccess }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customerId, setCustomerId] = useState("");
  const [taxRate, setTaxRate] = useState(17);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // Item add karne ke liye state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Customers & Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custData, prodData] = await Promise.all([
          api.get<{ customers: Customer[] }>("/api/customers"),
          api.get<{ products: Product[] }>("/api/products"),
        ]);
        setCustomers(custData.customers || []);
        setProducts(prodData.products || []);
        if (custData.customers && custData.customers.length > 0) {
          setCustomerId(custData.customers[0]._id);
        }
      } catch (err) {
        console.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    if (quantity > product.stockQuantity) {
      alert(`Only ${product.stockQuantity} items available in stock!`);
      return;
    }

    // Check if product already added, if yes, just increase quantity
    const existingItemIndex = items.findIndex((i) => i.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * product.price;
      setItems(newItems);
    } else {
      const newItem: InvoiceItem = {
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price,
        total: product.price * quantity,
      };
      setItems([...items, newItem]);
    }

    // Reset inputs
    setQuantity(1);
    setSelectedProductId("");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subTotal * (taxRate / 100));
  const grandTotal = subTotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (items.length === 0) {
      setError("Please add at least one item to the invoice.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/invoices", {
        customerId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        taxRate,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">Create New Invoice</h2>
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

          <form id="invoiceForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer & Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Select Customer *</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                  <option value="" disabled>Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Tax Rate (%)</label>
                <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              </div>
            </div>

            {/* Add Items Section */}
            <div className="p-4 bg-(--surface-subtle) border border-(--border) rounded-lg">
              <h3 className="text-[13px] font-semibold text-(--text-primary) mb-3">Add Items</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] text-(--text-muted) mb-1">Product</label>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-(--border) rounded-md text-[13px] focus:outline-none bg-white">
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id} disabled={p.stockQuantity === 0}>
                        {p.name} - Rs {p.price} ({p.stockQuantity} in stock)
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
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Price</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-(--text-muted) uppercase">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {items.map((item, index) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-[13px] text-(--text-primary)">{item.productName}</td>
                        <td className="px-4 py-3 text-[13px]">{item.quantity}</td>
                        <td className="px-4 py-3 text-[13px]">Rs {item.unitPrice}</td>
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

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-[13px]">
                  <div className="flex justify-between text-(--text-secondary)">
                    <span>Subtotal:</span>
                    <span>Rs {subTotal}</span>
                  </div>
                  <div className="flex justify-between text-(--text-secondary)">
                    <span>Tax ({taxRate}%):</span>
                    <span>Rs {taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[15px] text-(--text-primary) pt-2 border-t border-(--border)">
                    <span>Grand Total:</span>
                    <span>Rs {grandTotal}</span>
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
          <button type="submit" form="invoiceForm" disabled={loading || items.length === 0} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Generating..." : "Generate Invoice"}
          </button>
        </div>

      </div>
    </div>
  );
}