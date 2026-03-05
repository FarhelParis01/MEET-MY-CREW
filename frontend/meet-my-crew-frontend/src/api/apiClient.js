const BASE_URL = "http://localhost/meet-my-crew/backend/public/";

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export function loginUser(email, password) {
  return request("login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile() {
  return request("my-profile.php");
}

export function getMessages() {
  return request("my-inbox.php");
}

export function getRequests() {
  return request("my-requests.php");
}

export function searchCreatives(query) {
  const queryString =
    typeof query === "string"
      ? `name=${encodeURIComponent(query)}`
      : new URLSearchParams(query || {}).toString();

  const endpoint = queryString ? `search.php?${queryString}` : "search.php";
  return request(endpoint);
}

export function sendRequest(data) {
  return request("request-send.php", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
