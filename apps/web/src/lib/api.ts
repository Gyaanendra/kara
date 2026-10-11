export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export const DEFAULT_ORG_ID = "org_76a82f1024344d4db6d8a588";

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    "x-org-id": DEFAULT_ORG_ID,
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${errorText}`);
  }
  return res.json();
}
