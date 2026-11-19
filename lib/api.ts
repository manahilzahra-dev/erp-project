const API_BASE = "";

interface ApiResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}
export async function apiRequest<T = ApiResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export const api = {
  get: <T = ApiResponse>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T = ApiResponse>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T = ApiResponse>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T = ApiResponse>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};