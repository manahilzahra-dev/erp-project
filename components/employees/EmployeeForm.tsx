"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface EmployeeFormProps {
  onClose: () => void;
    onSuccess: (employee?: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    joiningDate: string;
    salary: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  }) => void;
  initialData?: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    joiningDate: string;
    salary: number;
  } | null;
}

export default function EmployeeForm({ onClose, onSuccess, initialData }: EmployeeFormProps) {
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    employeeId: initialData?.employeeId || "",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    designation: initialData?.designation || "",
    department: initialData?.department || "Engineering",
    joiningDate: initialData?.joiningDate 
      ? new Date(initialData.joiningDate).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0],
    salary: initialData?.salary?.toString() || "",
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
           let response;
      if (isEditMode) {
        response = await api.put(`/api/employees/${initialData._id}`, {
          ...form,
          salary: Number(form.salary),
        });
      } else {
        response = await api.post("/api/employees", {
          ...form,
          salary: Number(form.salary),
        });
      }
            onSuccess(response.employee as {
        _id: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        designation: string;
        department: string;
        joiningDate: string;
        salary: number;
        status: string;
        createdAt?: string;
        updatedAt?: string;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee");
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
            {isEditMode ? "Edit Employee" : "Add New Employee"}
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

          <form id="employeeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Employee ID *</label>
              <input type="text" name="employeeId" required value={form.employeeId} onChange={handleChange} placeholder="e.g. EMP-001"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Email *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="employee@company.com"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">First Name *</label>
              <input type="text" name="firstName" required value={form.firstName} onChange={handleChange} placeholder="Ali"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Last Name *</label>
              <input type="text" name="lastName" required value={form.lastName} onChange={handleChange} placeholder="Khan"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Phone *</label>
              <input type="text" name="phone" required value={form.phone} onChange={handleChange} placeholder="+92 300 1234567"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Designation *</label>
              <input type="text" name="designation" required value={form.designation} onChange={handleChange} placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Department *</label>
              <select name="department" required value={form.department} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Joining Date *</label>
              <input type="date" name="joiningDate" required value={form.joiningDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Monthly Salary (PKR) *</label>
              <input type="number" name="salary" required min="0" value={form.salary} onChange={handleChange} placeholder="e.g. 85000"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="employeeForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (isEditMode ? "Update Employee" : "Save Employee")}
          </button>
        </div>

      </div>
    </div>
  );
}