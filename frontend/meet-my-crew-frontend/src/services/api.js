const BASE_URL = "http://localhost/meet-my-crew/backend/public";

function buildUrl(path, query) {
  const url = new URL(`${BASE_URL}${path}`);
  if (!query) return url.toString();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, query } = options;
  const res = await fetch(buildUrl(path, query), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export async function loginUser({ email, password }) {
  return apiRequest("/login.php", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerUser({
  full_name,
  email,
  password,
  role,
  region,
  city,
}) {
  return apiRequest("/register.php", {
    method: "POST",
    body: {
      name: full_name,
      email,
      password,
      role,
      region,
      city,
    },
  });
}

export async function getProfile() {
  return apiRequest("/my-profile.php");
}

export async function updateProfile({
  full_name,
  role,
  city,
  region,
  bio,
  skills,
  availability = "available",
  phone = "",
}) {
  return apiRequest("/update-profile.php", {
    method: "POST",
    body: {
      full_name,
      role,
      city,
      region,
      bio: bio ?? "",
      skills: Array.isArray(skills) ? skills.join(", ") : skills ?? "",
      availability,
      phone,
    },
  });
}

export async function fetchCreatives(filters = {}) {
  return apiRequest("/search.php", { query: filters });
}

export async function sendCollaborationRequest({ receiver_id, message }) {
  return apiRequest("/request-send.php", {
    method: "POST",
    body: { receiver_id, message },
  });
}

export async function fetchCollaborationRequests() {
  return apiRequest("/my-requests.php");
}

export async function respondCollaborationRequest({ request_id, action }) {
  return apiRequest("/request-respond.php", {
    method: "POST",
    body: { request_id, action },
  });
}
export async function fetchInbox() {
  return apiRequest("/my-inbox.php");
}
