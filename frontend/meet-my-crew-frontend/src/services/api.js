const BASE_URL = "http://localhost/meet-my-crew-backend/public";

export async function apiRequest(path, method = "GET", body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANT for PHP sessions
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}