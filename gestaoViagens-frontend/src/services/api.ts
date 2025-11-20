const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
  return response;
}
