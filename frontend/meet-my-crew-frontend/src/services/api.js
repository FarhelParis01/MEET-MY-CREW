const BASE_URL = "http://localhost/meet-my-crew/backend/public";

export async function apiRequest(path, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ sends/receives PHP session cookie
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}