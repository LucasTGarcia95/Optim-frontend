const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function request(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const getWorkspace = (workspaceId, token) =>
  request(`/api/workspaces/${workspaceId}`, { token });

export const getMembers = (workspaceId, token) =>
  request(`/api/workspaces/${workspaceId}/members`, { token });

export const inviteMember = (workspaceId, email, token) =>
  request(`/api/workspaces/${workspaceId}/invite`, {
    token,
    method: "POST",
    body: { email },
  });

export const removeMember = (workspaceId, userId, token) =>
  request(`/api/workspaces/${workspaceId}/members/${userId}`, {
    token,
    method: "DELETE",
  });
