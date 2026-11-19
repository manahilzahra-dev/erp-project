"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface Project {
  _id: string;
  name: string;
}

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    title: string;
    description?: string;
    projectId: string | { _id: string };
    assignedTo: string | { _id: string };
    priority: string;
    status: string;
    dueDate: string;
  } | null;
}

export default function TaskForm({ onClose, onSuccess, initialData }: TaskFormProps) {
  const isEditMode = !!initialData;

  const today = new Date();
  const defaultDueDate = new Date(today);
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);

  const initialProjectId = typeof initialData?.projectId === "object" 
    ? initialData.projectId._id 
    : initialData?.projectId || "";

  const initialAssignedTo = typeof initialData?.assignedTo === "object" 
    ? initialData.assignedTo._id 
    : initialData?.assignedTo || "";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    projectId: initialProjectId,
    assignedTo: initialAssignedTo,
    priority: initialData?.priority || "medium",
    status: initialData?.status || "pending",
    dueDate: initialData?.dueDate 
      ? new Date(initialData.dueDate).toISOString().split("T")[0] 
      : defaultDueDate.toISOString().split("T")[0],
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, projData] = await Promise.all([
          api.get<{ employees: Employee[] }>("/api/employees"),
          api.get<{ projects: Project[] }>("/api/projects"),
        ]);
        setEmployees(empData.employees || []);
        setProjects(projData.projects || []);
        
        if (!isEditMode) {
          if (empData.employees && empData.employees.length > 0 && !form.assignedTo) {
            setForm((prev) => ({ ...prev, assignedTo: empData.employees[0]._id }));
          }
          if (projData.projects && projData.projects.length > 0 && !form.projectId) {
            setForm((prev) => ({ ...prev, projectId: projData.projects[0]._id }));
          }
        }
      } catch {
        console.error("Failed to load data");
      }
    };
    fetchData();
  }, [isEditMode, form.assignedTo, form.projectId]);

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
      if (isEditMode) {
        await api.put(`/api/tasks/${initialData._id}`, form);
      } else {
        await api.post("/api/tasks", form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">
            {isEditMode ? "Edit Task" : "Create New Task"}
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Task Title *</label>
              <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Design Homepage"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Description (Optional)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) resize-none"
                placeholder="Task details..." />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Project *</label>
              <select name="projectId" required value={form.projectId} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="" disabled>Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Assign To *</label>
              <select name="assignedTo" required value={form.assignedTo} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="" disabled>Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Priority *</label>
                <select name="priority" required value={form.priority} onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Due Date *</label>
                <input type="date" name="dueDate" required value={form.dueDate} onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Status *</label>
              <select name="status" required value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="taskForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (isEditMode ? "Update Task" : "Create Task")}
          </button>
        </div>

      </div>
    </div>
  );
}