// Custom fetch that injects the auth token
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("nebula_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
