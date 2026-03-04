const BASE_URL = "http://localhost/meet-my-crew/backend/public";

export async function apiRequest(path, method = "GET", body) {
  console.log("METHOD BEING USED:", method);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}