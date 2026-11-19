"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ProductForm from "@/components/inventory/ProductForm";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: string;
  description?: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null); // View modal state

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ products: Product[]; lowStockCount: number }>("/api/products");
      setProducts(data.products || []);
      setLowStockCount(data.lowStockCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    load();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/products/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditProduct(null);
  };

  if (user && !["admin", "inventory", "management"].includes(user.role)) {
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

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Inventory</h1>
          <p className="text-[14px] text-(--text-secondary) mt-1">Manage your products and stock levels</p>
        </div>
        
        {user && ["admin", "inventory"].includes(user.role) && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[14px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.993l-6.928-12c-.77-1.326-2.694-1.326-3.464 0l-6.928 12c-.77 1.326.192 2.993 1.732 2.993z" />
          </svg>
          <div>
            <p className="font-semibold text-[14px]">Low Stock Alert</p>
            <p className="text-[13px] mt-0.5">
              {lowStockCount} product{lowStockCount > 1 ? "s" : ""} {lowStockCount > 1 ? "are" : "is"} running low on stock. Please reorder soon.
            </p>
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-(--text-muted)">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No products found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Click &quot;Add Product&quot; to get started.</p>
                  </td>
                </tr>
              )}

              {!loading && products.map((product) => {
                const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                return (
                  <tr key={product._id} className="hover:bg-(--surface-subtle) transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[14px] font-medium text-(--text-primary)">{product.name}</p>
                        <p className="text-[12px] text-(--text-muted) font-mono">{product.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{product.category}</td>
                    <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{formatPKR(product.costPrice)}</td>
                    <td className="px-6 py-4 text-[13px] text-(--text-primary) font-medium">{formatPKR(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-medium ${isLowStock ? "text-red-600" : "text-(--text-primary)"}`}>
                          {product.stockQuantity} units
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* View Button */}
                        <button 
                          onClick={() => setViewProduct(product)}
                          className="p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-subtle) rounded transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        {/* Edit Button */}
                        {user && ["admin", "inventory"].includes(user.role) && (
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="p-1.5 text-(--text-muted) hover:text-(--brand-600) hover:bg-(--brand-50) rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                        )}

                        {/* Delete Button */}
                        {user?.role === "admin" && (
                          <button 
                            onClick={() => setDeleteId(product._id)}
                            className="p-1.5 text-(--text-muted) hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add/Edit) */}
      {isFormOpen && (
        <ProductForm 
          initialData={editProduct}
          onClose={handleCloseForm} 
          onSuccess={() => {
            handleCloseForm();
            fetchProducts();
          }} 
        />
      )}

      {/* View Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface) w-full max-w-lg rounded-xl shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-(--text-primary)">Product Details</h2>
              <button onClick={() => setViewProduct(null)} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Product Name</p>
                <p className="text-[15px] font-medium text-(--text-primary)">{viewProduct.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">SKU Code</p>
                  <p className="text-[14px] font-mono text-(--text-secondary)">{viewProduct.sku}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Category</p>
                  <p className="text-[14px] text-(--text-secondary)">{viewProduct.category}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Cost Price</p>
                  <p className="text-[14px] text-(--text-secondary)">{formatPKR(viewProduct.costPrice)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Selling Price</p>
                  <p className="text-[14px] font-medium text-(--text-primary)">{formatPKR(viewProduct.price)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Stock Quantity</p>
                  <p className="text-[14px] text-(--text-secondary)">{viewProduct.stockQuantity} units</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Low Stock Alert</p>
                  <p className="text-[14px] text-(--text-secondary)">Below {viewProduct.lowStockThreshold} units</p>
                </div>
              </div>
              {viewProduct.description && (
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Description</p>
                  <p className="text-[14px] text-(--text-secondary) leading-relaxed">{viewProduct.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-(--border) bg-(--surface-subtle) rounded-b-xl flex justify-end">
              <button onClick={() => setViewProduct(null)} className="px-4 py-2 bg-(--surface) border border-(--border) text-[13px] font-medium text-(--text-primary) rounded-md hover:bg-(--surface-subtle) transition-colors">
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
            <h3 className="text-[16px] font-semibold text-(--text-primary) mb-2">Delete Product?</h3>
            <p className="text-[13px] text-(--text-secondary) mb-6">
              This action cannot be undone. This will permanently delete the product from inventory.
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