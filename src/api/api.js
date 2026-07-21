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

export const getProjectBoard = (projectId, token) =>
  request(`/projects/${projectId}/board`, { token });

export const getColumns = (boardId, token) =>
  request(`/boards/${boardId}/columns`, { token });

export const getTasks = (projectId, token) =>
  request(`/tasks?project_id=${projectId}`, { token });

export const createTask = (body, token) =>
  request(`/tasks`, { token, method: "POST", body });

export const updateTask = (taskId, body, token) =>
  request(`/tasks/${taskId}`, { token, method: "PATCH", body });

export const deleteTask = (taskId, token) =>
  request(`/tasks/${taskId}`, { token, method: "DELETE" });

export const createColumn = (boardId, name, token) =>
  request(`/boards/${boardId}/columns`, {
    token,
    method: "POST",
    body: { name },
  });

export const renameColumn = (columnId, name, token) =>
  request(`/columns/${columnId}`, { token, method: "PATCH", body: { name } });

export const reorderColumns = (boardId, orderedColumnIds, token) =>
  request(`/boards/${boardId}/columns/reorder`, {
    token,
    method: "PATCH",
    body: { orderedColumnIds },
  });

export const deleteColumn = (columnId, token) =>
  request(`/columns/${columnId}`, { token, method: "DELETE" });
